import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type {
  MapSnapshot,
  PublishedMap,
  PublishedMapV2,
  MapContentV2,
} from '@senkom/shared-types';
import schema from '../schema/published-map.v1.json';
import schemaV2 from '../schema/published-map.v2.json';
import contentSchema from '../schema/map-content.v2.json';

const ajv = new Ajv2020({
  strict: true,
  allErrors: false,
  validateFormats: true,
});
addFormats(ajv);
const validate = ajv.compile<PublishedMap>(schema);
const validateV2 = ajv.compile<PublishedMapV2>(schemaV2);
const validateContent = ajv.compile<MapContentV2>(contentSchema);

function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid published map: ${message}`);
}

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  const index = new Map(items.map((item) => [item.id, item]));
  requireValid(index.size === items.length, 'duplicate entity ID');
  return index;
}

export function parsePublishedMap(input: unknown): PublishedMap {
  requireValid(validate(input), 'schema validation failed');
  validateReferences(input);
  return input;
}

export function parsePublishedMapV2(input: unknown): PublishedMapV2 {
  requireValid(validateV2(input), 'schema v2 validation failed');
  validateReferences(input);
  return input;
}

export function parseMapSnapshot(input: unknown): MapSnapshot {
  return input &&
    typeof input === 'object' &&
    'schemaVersion' in input &&
    input.schemaVersion === 1
    ? parsePublishedMap(input)
    : parsePublishedMapV2(input);
}

export function parseMapContent(input: unknown): MapContentV2 {
  requireValid(validateContent(input), 'draft schema validation failed');
  return input;
}

function validateReferences(input: MapSnapshot): void {
  const sites = indexById(input.sites);
  const devices = indexById(input.devices);
  const ports = indexById(input.ports);
  const cables = indexById(input.cables);
  const cores = indexById(input.fiberCores);
  const terminations = indexById(input.fiberTerminations);
  const splices = indexById(input.fiberSplices);
  const links = indexById(input.logicalLinks);
  const circuits = indexById(input.powerCircuits);
  const nodes = indexById(input.layout.nodes);
  indexById(input.layout.edges);
  indexById(input.routes);
  indexById(input.cameras);
  const opticalPort = (id: string) =>
    ['sfp', 'fiber'].includes(ports.get(id)?.type ?? '');
  const pointInBounds = (point: { x: number; y: number }) =>
    point.x <= input.layout.width && point.y <= input.layout.height;

  for (const device of devices.values())
    requireValid(sites.has(device.siteId), 'device references missing site');
  for (const port of ports.values())
    requireValid(devices.has(port.deviceId), 'port references missing device');
  for (const cable of cables.values())
    requireValid(
      sites.has(cable.fromSiteId) && sites.has(cable.toSiteId),
      'cable references missing site',
    );
  const coreNumbers = new Set<string>();
  for (const core of cores.values()) {
    const cable = cables.get(core.cableId);
    requireValid(
      cable?.kind === 'fiber' && core.coreNumber <= cable.totalCores,
      'core exceeds fiber cable capacity or references non-fiber cable',
    );
    const key = `${core.cableId}:${core.coreNumber}`;
    requireValid(!coreNumbers.has(key), 'duplicate cable/core number');
    coreNumbers.add(key);
  }
  const terminatedEnds = new Set<string>();
  for (const termination of terminations.values()) {
    const core = cores.get(termination.fiberCoreId);
    const cable = core && cables.get(core.cableId);
    const port = ports.get(termination.portId);
    const siteId = port && devices.get(port.deviceId)?.siteId;
    requireValid(
      cable && opticalPort(termination.portId),
      'termination references missing core or non-optical port',
    );
    requireValid(
      siteId ===
        (termination.endSide === 'a' ? cable.fromSiteId : cable.toSiteId),
      'termination at wrong cable end',
    );
    const key = `${termination.fiberCoreId}:${termination.endSide}`;
    requireValid(!terminatedEnds.has(key), 'duplicate core end termination');
    terminatedEnds.add(key);
  }
  for (const splice of splices.values()) {
    const from = cores.get(splice.fromFiberCoreId);
    const to = cores.get(splice.toFiberCoreId);
    const closure = devices.get(splice.closureDeviceId);
    requireValid(
      from && to && from.id !== to.id && closure?.type === 'splice_closure',
      'invalid splice references',
    );
    for (const core of [from, to]) {
      const cable = cables.get(core.cableId);
      requireValid(
        cable && [cable.fromSiteId, cable.toSiteId].includes(closure.siteId),
        'splice closure outside cable endpoints',
      );
    }
    requireValid(!terminations.has(splice.id), 'ambiguous fiber connection ID');
  }
  for (const link of links.values()) {
    requireValid(
      opticalPort(link.fromPortId) && opticalPort(link.toPortId),
      'logical link requires optical ports',
    );
    requireValid(
      link.coreSegments.every((id) => cores.has(id)),
      'logical link references missing core',
    );
  }
  for (const circuit of circuits.values()) {
    requireValid(
      ports.get(circuit.sourcePortId)?.type === 'terminal' &&
        ports.get(circuit.destinationPortId)?.type === 'terminal',
      'power circuit requires terminal ports',
    );
    requireValid(
      circuit.cableIds.every((id) => cables.get(id)?.kind === 'power'),
      'power circuit requires power cables',
    );
  }
  for (const route of input.routes)
    requireValid(
      route.cableIds.every((id) => cables.has(id)),
      'corridor references missing cable',
    );
  for (const camera of input.cameras)
    requireValid(sites.has(camera.siteId), 'camera references missing site');
  for (const node of nodes.values()) {
    requireValid(
      (node.entityType === 'site' ? sites : devices).has(node.entityId),
      'layout node references missing entity',
    );
    requireValid(pointInBounds(node), 'layout node outside canvas');
  }
  for (const edge of input.layout.edges) {
    requireValid(
      nodes.has(edge.fromNodeId) && nodes.has(edge.toNodeId),
      'edge references missing node',
    );
    requireValid(
      input.layers.includes(edge.layer),
      'edge layer not enabled in snapshot',
    );
    requireValid(
      edge.points.every(pointInBounds),
      'edge waypoint outside canvas',
    );
    const isPower = edge.connectionType.startsWith('power_');
    requireValid(
      edge.layer.startsWith(isPower ? 'power_' : 'fo_'),
      'edge layer conflicts with connection type',
    );
    switch (edge.connectionType) {
      case 'fiber_cable_segment':
        requireValid(
          cables.get(edge.connectionId)?.kind === 'fiber',
          'edge requires fiber cable',
        );
        break;
      case 'power_cable_segment':
        requireValid(
          cables.get(edge.connectionId)?.kind === 'power',
          'edge requires power cable',
        );
        break;
      case 'fiber_core_connection':
        requireValid(
          splices.has(edge.connectionId) || terminations.has(edge.connectionId),
          'edge requires explicit splice or termination',
        );
        break;
      case 'logical_link':
        requireValid(
          links.get(edge.connectionId)?.routeName === edge.layer,
          'edge requires matching logical link',
        );
        break;
      case 'power_circuit':
        requireValid(
          circuits.has(edge.connectionId),
          'edge requires power circuit',
        );
        break;
    }
  }
  // Physical path/allocation proof runs again in the backend publication transaction.
}
