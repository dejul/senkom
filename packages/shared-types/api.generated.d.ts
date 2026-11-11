export interface paths {
  '/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Phase 0 process liveness only; not database or gateway readiness */
    get: operations['getHealth'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/viewer/map': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** read only the latest validated published map */
    get: operations['getPublishedMap'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/viewer/cameras': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** public camera metadata without stream credentials */
    get: operations['getViewerCameras'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/viewer/version-policy': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Planned: release installation policy, separate from map revisions */
    get: operations['getVersionPolicy'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/session': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getAdminSession'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['loginAdmin'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/logout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['logoutAdmin'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map/draft': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getDraft'];
    put: operations['saveDraft'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map/validate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['validateDraft'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['publishDraft'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map/rollback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['rollbackMap'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map-revisions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRevisions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map-revisions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRevision'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/audit-logs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listAuditLogs'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map-layouts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getLayout'];
    put: operations['saveLayout'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/sites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listSite'];
    put?: never;
    post: operations['createSite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/sites/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getSite'];
    put: operations['replaceSite'];
    post?: never;
    delete: operations['deleteSite'];
    options?: never;
    head?: never;
    patch: operations['updateSite'];
    trace?: never;
  };
  '/admin/devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listDevice'];
    put?: never;
    post: operations['createDevice'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/devices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getDevice'];
    put: operations['replaceDevice'];
    post?: never;
    delete: operations['deleteDevice'];
    options?: never;
    head?: never;
    patch: operations['updateDevice'];
    trace?: never;
  };
  '/admin/ports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listPort'];
    put?: never;
    post: operations['createPort'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/ports/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getPort'];
    put: operations['replacePort'];
    post?: never;
    delete: operations['deletePort'];
    options?: never;
    head?: never;
    patch: operations['updatePort'];
    trace?: never;
  };
  '/admin/cables': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listCable'];
    put?: never;
    post: operations['createCable'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/cables/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getCable'];
    put: operations['replaceCable'];
    post?: never;
    delete: operations['deleteCable'];
    options?: never;
    head?: never;
    patch: operations['updateCable'];
    trace?: never;
  };
  '/admin/fiber-cores': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listFiberCore'];
    put?: never;
    post: operations['createFiberCore'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/fiber-cores/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getFiberCore'];
    put: operations['replaceFiberCore'];
    post?: never;
    delete: operations['deleteFiberCore'];
    options?: never;
    head?: never;
    patch: operations['updateFiberCore'];
    trace?: never;
  };
  '/admin/fiber-terminations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listFiberTermination'];
    put?: never;
    post: operations['createFiberTermination'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/fiber-terminations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getFiberTermination'];
    put: operations['replaceFiberTermination'];
    post?: never;
    delete: operations['deleteFiberTermination'];
    options?: never;
    head?: never;
    patch: operations['updateFiberTermination'];
    trace?: never;
  };
  '/admin/fiber-splices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listFiberSplice'];
    put?: never;
    post: operations['createFiberSplice'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/fiber-splices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getFiberSplice'];
    put: operations['replaceFiberSplice'];
    post?: never;
    delete: operations['deleteFiberSplice'];
    options?: never;
    head?: never;
    patch: operations['updateFiberSplice'];
    trace?: never;
  };
  '/admin/logical-links': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listLogicalLink'];
    put?: never;
    post: operations['createLogicalLink'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/logical-links/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getLogicalLink'];
    put: operations['replaceLogicalLink'];
    post?: never;
    delete: operations['deleteLogicalLink'];
    options?: never;
    head?: never;
    patch: operations['updateLogicalLink'];
    trace?: never;
  };
  '/admin/power-circuits': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listPowerCircuit'];
    put?: never;
    post: operations['createPowerCircuit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/power-circuits/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getPowerCircuit'];
    put: operations['replacePowerCircuit'];
    post?: never;
    delete: operations['deletePowerCircuit'];
    options?: never;
    head?: never;
    patch: operations['updatePowerCircuit'];
    trace?: never;
  };
  '/admin/route-corridors': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRouteCorridor'];
    put?: never;
    post: operations['createRouteCorridor'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/route-corridors/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRouteCorridor'];
    put: operations['replaceRouteCorridor'];
    post?: never;
    delete: operations['deleteRouteCorridor'];
    options?: never;
    head?: never;
    patch: operations['updateRouteCorridor'];
    trace?: never;
  };
  '/admin/cameras': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listCamera'];
    put?: never;
    post: operations['createCamera'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/cameras/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getCamera'];
    put: operations['replaceCamera'];
    post?: never;
    delete: operations['deleteCamera'];
    options?: never;
    head?: never;
    patch: operations['updateCamera'];
    trace?: never;
  };
  '/admin/map-nodes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listMapNode'];
    put?: never;
    post: operations['createMapNode'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map-nodes/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getMapNode'];
    put: operations['replaceMapNode'];
    post?: never;
    delete: operations['deleteMapNode'];
    options?: never;
    head?: never;
    patch: operations['updateMapNode'];
    trace?: never;
  };
  '/admin/map-edges': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listMapEdge'];
    put?: never;
    post: operations['createMapEdge'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/map-edges/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getMapEdge'];
    put: operations['replaceMapEdge'];
    post?: never;
    delete: operations['deleteMapEdge'];
    options?: never;
    head?: never;
    patch: operations['updateMapEdge'];
    trace?: never;
  };
  '/viewer/sites/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getViewerSite'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/viewer/cables/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getViewerCable'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    PublishedMap: components['schemas']['published-map.v1'];
    Site: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      name: components['schemas']['Name'];
      /** @enum {string} */
      type: 'control_center' | 'field_site' | 'substation';
      description?: string;
      status: components['schemas']['InventoryStatus'];
    };
    Device: {
      id: components['schemas']['Id'];
      siteId: components['schemas']['Id'];
      code: components['schemas']['Id'];
      /** @enum {string} */
      type:
        | 'router'
        | 'switch'
        | 'otb'
        | 'odf'
        | 'splice_closure'
        | 'power_panel'
        | 'ups'
        | 'source'
        | 'junction';
      model?: components['schemas']['Name'];
      status: components['schemas']['InventoryStatus'];
    };
    Port: {
      id: components['schemas']['Id'];
      deviceId: components['schemas']['Id'];
      name: components['schemas']['Name'];
      /** @enum {string} */
      type: 'sfp' | 'fiber' | 'terminal';
      status: components['schemas']['InventoryStatus'];
    };
    Cable:
      components['schemas']['FiberCable'] | components['schemas']['PowerCable'];
    FiberCore: {
      id: components['schemas']['Id'];
      cableId: components['schemas']['Id'];
      coreNumber: number;
      /** @enum {string} */
      status: 'unallocated' | 'allocated' | 'faulty' | 'unknown';
    };
    FiberTermination: {
      id: components['schemas']['Id'];
      fiberCoreId: components['schemas']['Id'];
      portId: components['schemas']['Id'];
      /** @enum {string} */
      endSide: 'a' | 'b';
    };
    FiberSplice: {
      id: components['schemas']['Id'];
      fromFiberCoreId: components['schemas']['Id'];
      toFiberCoreId: components['schemas']['Id'];
      closureDeviceId: components['schemas']['Id'];
    };
    LogicalLink: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      fromPortId: components['schemas']['Id'];
      toPortId: components['schemas']['Id'];
      /** @enum {string} */
      routeName: 'fo_ring_a' | 'fo_ring_b';
      /** @description Ordered fiber core IDs, never a computed availability guarantee. */
      coreSegments: components['schemas']['Id'][];
    };
    PowerCircuit: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      sourcePortId: components['schemas']['Id'];
      destinationPortId: components['schemas']['Id'];
      /** @enum {string} */
      supplyType: 'pln' | 'ups' | 'backup';
      cableIds: components['schemas']['Id'][];
      status: components['schemas']['InventoryStatus'];
    };
    RouteCorridor: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      name: components['schemas']['Name'];
      cableIds: components['schemas']['Id'][];
    };
    Camera: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      siteId: components['schemas']['Id'];
      name: components['schemas']['Name'];
      enabled: boolean;
    };
    /** @enum {string} */
    Role:
      'senkom_viewer' | 'infrastructure_editor' | 'publisher' | 'system_admin';
    Meta: {
      /** @constant */
      apiVersion: '1';
      /** @constant */
      schemaVersion: 1;
    };
    HealthResponse: {
      data: {
        /** @constant */
        status: 'ok';
        /** @constant */
        phase: 0;
      };
      meta: components['schemas']['Meta'];
    };
    MapResponse: {
      data: components['schemas']['published-map.v1'];
      meta: components['schemas']['Meta'];
    };
    ErrorResponse: {
      error: {
        code: string;
        message: string;
      };
    };
    ReleasePolicy: {
      /** @enum {string} */
      channel: 'stable' | 'testing';
      minimumDesktopVersion: string;
      /** @constant */
      minimumApiVersion: '1';
      /** @constant */
      installMode: 'maintenance-or-admin';
      /** @constant */
      autoInstallOnAppQuit: false;
      /** @constant */
      majorRequiresApproval: true;
      supportedMapSchemaVersions: 1[];
    };
    PublishedMapV2: components['schemas']['published-map.v2'];
    MapContentV2: components['schemas']['map-content.v2'];
    MetaV2: {
      /** @constant */
      apiVersion: '1';
      /** @constant */
      schemaVersion: 2;
      page?: number;
      perPage?: number;
      total?: number;
      draftVersion?: number;
    };
    MapResponseV2: {
      data: components['schemas']['published-map.v2'];
      meta: components['schemas']['MetaV2'];
    };
    Draft: {
      mapId: string;
      version: number;
      /** @enum {string} */
      status: 'draft' | 'validated';
      activeRevisionId: string | null;
      content: components['schemas']['map-content.v2'];
    };
    DraftResponse: {
      data: components['schemas']['Draft'];
      meta: components['schemas']['MetaV2'];
    };
    ValidationIssue: {
      path: string;
      code: string;
      message: string;
    };
    ValidationResponse: {
      data: {
        valid: boolean;
        version: number;
        issues: components['schemas']['ValidationIssue'][];
      };
      meta: components['schemas']['MetaV2'];
    };
    PublicationResponse: {
      data: {
        revisionId: string;
        /** Format: date-time */
        publishedAt: string;
      };
      meta: components['schemas']['MetaV2'];
    };
    Revision: {
      revisionId: string;
      draftVersion: number;
      /** Format: date-time */
      publishedAt: string;
      publishedBy: string;
      checksum: string;
    };
    RevisionListResponse: {
      data: components['schemas']['Revision'][];
      meta: components['schemas']['MetaV2'];
    };
    AuditEntry: {
      id: number;
      actorId: string | null;
      action: string;
      /** Format: date-time */
      createdAt: string;
    };
    AuditListResponse: {
      data: components['schemas']['AuditEntry'][];
      meta: components['schemas']['MetaV2'];
    };
    AdminSession: {
      data: {
        csrfToken: string;
        user: null | {
          id: string;
          name: string;
          roles: components['schemas']['Role'][];
        };
      };
      meta: components['schemas']['MetaV2'];
    };
    LayoutV2: components['schemas']['$defs-Layout'];
    LayoutResponse: {
      data: components['schemas']['$defs-Layout'];
      meta: components['schemas']['MetaV2'];
    };
    SiteV2: components['schemas']['$defs-Site'];
    SiteResponse: {
      data: components['schemas']['$defs-Site'];
      meta: components['schemas']['MetaV2'];
    };
    SiteListResponse: {
      data: components['schemas']['$defs-Site'][];
      meta: components['schemas']['MetaV2'];
    };
    SitePatch: {
      id?: components['schemas']['Id'];
      code?: components['schemas']['Id'];
      name?: components['schemas']['Name'];
      /** @enum {string} */
      type?: 'control_center' | 'field_site' | 'substation';
      description?: string;
      status?: components['schemas']['InventoryStatus'];
      geography?: {
        latitude: number;
        longitude: number;
      };
      metadata?: components['schemas']['Metadata'];
    };
    DeviceV2: components['schemas']['$defs-Device'];
    DeviceResponse: {
      data: components['schemas']['$defs-Device'];
      meta: components['schemas']['MetaV2'];
    };
    DeviceListResponse: {
      data: components['schemas']['$defs-Device'][];
      meta: components['schemas']['MetaV2'];
    };
    DevicePatch: {
      id?: components['schemas']['Id'];
      siteId?: components['schemas']['Id'];
      code?: components['schemas']['Id'];
      /** @enum {string} */
      type?:
        | 'router'
        | 'switch'
        | 'otb'
        | 'odf'
        | 'splice_closure'
        | 'power_panel'
        | 'ups'
        | 'source'
        | 'junction'
        | 'pdu'
        | 'other';
      model?: components['schemas']['Name'];
      status?: components['schemas']['InventoryStatus'];
    };
    PortV2: components['schemas']['Port'];
    PortResponse: {
      data: components['schemas']['Port'];
      meta: components['schemas']['MetaV2'];
    };
    PortListResponse: {
      data: components['schemas']['Port'][];
      meta: components['schemas']['MetaV2'];
    };
    PortPatch: {
      id?: components['schemas']['Id'];
      deviceId?: components['schemas']['Id'];
      name?: components['schemas']['Name'];
      /** @enum {string} */
      type?: 'sfp' | 'fiber' | 'terminal';
      status?: components['schemas']['InventoryStatus'];
    };
    CableV2: components['schemas']['Cable'];
    CableResponse: {
      data: components['schemas']['Cable'];
      meta: components['schemas']['MetaV2'];
    };
    CableListResponse: {
      data: components['schemas']['Cable'][];
      meta: components['schemas']['MetaV2'];
    };
    CablePatch:
      | {
          id?: components['schemas']['Id'];
          code?: components['schemas']['Id'];
          /** @constant */
          kind?: 'fiber';
          fromSiteId?: components['schemas']['Id'];
          toSiteId?: components['schemas']['Id'];
          lengthM?: number;
          status?: components['schemas']['InventoryStatus'];
          totalCores?: number;
          /** @enum {string} */
          fiberType?: 'single_mode' | 'multi_mode' | 'unknown';
          conductorCount?: never;
          crossSectionMm2?: never;
          voltageV?: never;
        }
      | {
          id?: components['schemas']['Id'];
          code?: components['schemas']['Id'];
          /** @constant */
          kind?: 'power';
          fromSiteId?: components['schemas']['Id'];
          toSiteId?: components['schemas']['Id'];
          lengthM?: number;
          status?: components['schemas']['InventoryStatus'];
          conductorCount?: number;
          crossSectionMm2?: number;
          voltageV?: number;
          totalCores?: never;
          fiberType?: never;
        };
    FiberCoreV2: components['schemas']['FiberCore'];
    FiberCoreResponse: {
      data: components['schemas']['FiberCore'];
      meta: components['schemas']['MetaV2'];
    };
    FiberCoreListResponse: {
      data: components['schemas']['FiberCore'][];
      meta: components['schemas']['MetaV2'];
    };
    FiberCorePatch: {
      id?: components['schemas']['Id'];
      cableId?: components['schemas']['Id'];
      coreNumber?: number;
      /** @enum {string} */
      status?: 'unallocated' | 'allocated' | 'faulty' | 'unknown';
    };
    FiberTerminationV2: components['schemas']['FiberTermination'];
    FiberTerminationResponse: {
      data: components['schemas']['FiberTermination'];
      meta: components['schemas']['MetaV2'];
    };
    FiberTerminationListResponse: {
      data: components['schemas']['FiberTermination'][];
      meta: components['schemas']['MetaV2'];
    };
    FiberTerminationPatch: {
      id?: components['schemas']['Id'];
      fiberCoreId?: components['schemas']['Id'];
      portId?: components['schemas']['Id'];
      /** @enum {string} */
      endSide?: 'a' | 'b';
    };
    FiberSpliceV2: components['schemas']['FiberSplice'];
    FiberSpliceResponse: {
      data: components['schemas']['FiberSplice'];
      meta: components['schemas']['MetaV2'];
    };
    FiberSpliceListResponse: {
      data: components['schemas']['FiberSplice'][];
      meta: components['schemas']['MetaV2'];
    };
    FiberSplicePatch: {
      id?: components['schemas']['Id'];
      fromFiberCoreId?: components['schemas']['Id'];
      toFiberCoreId?: components['schemas']['Id'];
      closureDeviceId?: components['schemas']['Id'];
    };
    LogicalLinkV2: components['schemas']['LogicalLink'];
    LogicalLinkResponse: {
      data: components['schemas']['LogicalLink'];
      meta: components['schemas']['MetaV2'];
    };
    LogicalLinkListResponse: {
      data: components['schemas']['LogicalLink'][];
      meta: components['schemas']['MetaV2'];
    };
    LogicalLinkPatch: {
      id?: components['schemas']['Id'];
      code?: components['schemas']['Id'];
      fromPortId?: components['schemas']['Id'];
      toPortId?: components['schemas']['Id'];
      /** @enum {string} */
      routeName?: 'fo_ring_a' | 'fo_ring_b';
      /** @description Ordered fiber core IDs, never a computed availability guarantee. */
      coreSegments?: components['schemas']['Id'][];
    };
    PowerCircuitV2: components['schemas']['PowerCircuit'];
    PowerCircuitResponse: {
      data: components['schemas']['PowerCircuit'];
      meta: components['schemas']['MetaV2'];
    };
    PowerCircuitListResponse: {
      data: components['schemas']['PowerCircuit'][];
      meta: components['schemas']['MetaV2'];
    };
    PowerCircuitPatch: {
      id?: components['schemas']['Id'];
      code?: components['schemas']['Id'];
      sourcePortId?: components['schemas']['Id'];
      destinationPortId?: components['schemas']['Id'];
      /** @enum {string} */
      supplyType?: 'pln' | 'ups' | 'backup';
      cableIds?: components['schemas']['Id'][];
      status?: components['schemas']['InventoryStatus'];
    };
    RouteCorridorV2: components['schemas']['RouteCorridor'];
    RouteCorridorResponse: {
      data: components['schemas']['RouteCorridor'];
      meta: components['schemas']['MetaV2'];
    };
    RouteCorridorListResponse: {
      data: components['schemas']['RouteCorridor'][];
      meta: components['schemas']['MetaV2'];
    };
    RouteCorridorPatch: {
      id?: components['schemas']['Id'];
      code?: components['schemas']['Id'];
      name?: components['schemas']['Name'];
      cableIds?: components['schemas']['Id'][];
    };
    CameraV2: components['schemas']['Camera'];
    CameraResponse: {
      data: components['schemas']['Camera'];
      meta: components['schemas']['MetaV2'];
    };
    CameraListResponse: {
      data: components['schemas']['Camera'][];
      meta: components['schemas']['MetaV2'];
    };
    CameraPatch: {
      id?: components['schemas']['Id'];
      code?: components['schemas']['Id'];
      siteId?: components['schemas']['Id'];
      name?: components['schemas']['Name'];
      enabled?: boolean;
    };
    MapNodeV2: components['schemas']['$defs-MapNode'];
    MapNodeResponse: {
      data: components['schemas']['$defs-MapNode'];
      meta: components['schemas']['MetaV2'];
    };
    MapNodeListResponse: {
      data: components['schemas']['$defs-MapNode'][];
      meta: components['schemas']['MetaV2'];
    };
    MapNodePatch: {
      id?: components['schemas']['Id'];
      /** @enum {string} */
      entityType?: 'site' | 'device';
      entityId?: components['schemas']['Id'];
      x?: number;
      y?: number;
      label?: components['schemas']['Name'];
      zIndex?: number;
      metadata?: components['schemas']['Metadata'];
      /** @enum {string} */
      symbol?:
        | 'site'
        | 'router'
        | 'switch'
        | 'otb'
        | 'odf'
        | 'splice_closure'
        | 'power_panel'
        | 'ups'
        | 'source'
        | 'junction'
        | 'pdu'
        | 'other';
    };
    MapEdgeV2: components['schemas']['$defs-MapEdge'];
    MapEdgeResponse: {
      data: components['schemas']['$defs-MapEdge'];
      meta: components['schemas']['MetaV2'];
    };
    MapEdgeListResponse: {
      data: components['schemas']['$defs-MapEdge'][];
      meta: components['schemas']['MetaV2'];
    };
    MapEdgePatch: {
      id?: components['schemas']['Id'];
      connectionId?: components['schemas']['Id'];
      /** @enum {string} */
      connectionType?:
        | 'fiber_cable_segment'
        | 'fiber_core_connection'
        | 'logical_link'
        | 'power_cable_segment'
        | 'power_circuit';
      fromNodeId?: components['schemas']['Id'];
      toNodeId?: components['schemas']['Id'];
      layer?: components['schemas']['Layer'];
      points?: components['schemas']['Point'][];
      label?: components['schemas']['Name'];
      zIndex?: number;
      metadata?: components['schemas']['Metadata'];
    };
    Id: string;
    Name: string;
    InventoryStatus: {
      /** @enum {string} */
      state: 'active' | 'inactive' | 'maintenance' | 'unknown';
      /** @enum {string} */
      source: 'inventory' | 'manual';
    };
    FiberCable: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      /** @constant */
      kind: 'fiber';
      fromSiteId: components['schemas']['Id'];
      toSiteId: components['schemas']['Id'];
      lengthM: number;
      status: components['schemas']['InventoryStatus'];
      totalCores: number;
      /** @enum {string} */
      fiberType: 'single_mode' | 'multi_mode' | 'unknown';
    };
    PowerCable: {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      /** @constant */
      kind: 'power';
      fromSiteId: components['schemas']['Id'];
      toSiteId: components['schemas']['Id'];
      lengthM: number;
      status: components['schemas']['InventoryStatus'];
      conductorCount: number;
      crossSectionMm2: number;
      voltageV: number;
    };
    /** @enum {string} */
    Layer: 'fo_ring_a' | 'fo_ring_b' | 'power_main' | 'power_backup';
    Point: {
      x: number;
      y: number;
    };
    MapNode: {
      id: components['schemas']['Id'];
      /** @enum {string} */
      entityType: 'site' | 'device';
      entityId: components['schemas']['Id'];
      x: number;
      y: number;
    };
    MapEdge: {
      id: components['schemas']['Id'];
      connectionId: components['schemas']['Id'];
      /** @enum {string} */
      connectionType:
        | 'fiber_cable_segment'
        | 'fiber_core_connection'
        | 'logical_link'
        | 'power_cable_segment'
        | 'power_circuit';
      fromNodeId: components['schemas']['Id'];
      toNodeId: components['schemas']['Id'];
      layer: components['schemas']['Layer'];
      points: components['schemas']['Point'][];
    };
    Layout: {
      width: number;
      height: number;
      nodes: components['schemas']['MapNode'][];
      edges: components['schemas']['MapEdge'][];
    };
    /**
     * SENKOM published map v1
     * @description Public snapshot only. No credentials, playback tokens, management IPs, or inferred connectivity.
     */
    'published-map.v1': {
      /** @constant */
      schemaVersion: 1;
      revision: components['schemas']['Id'];
      /** Format: date-time */
      publishedAt: string;
      /** @constant */
      status: 'published';
      /** @enum {string} */
      dataOrigin: 'demo' | 'production';
      demoLabel?: string;
      layout: components['schemas']['Layout'];
      layers: components['schemas']['Layer'][];
      sites: components['schemas']['Site'][];
      devices: components['schemas']['Device'][];
      ports: components['schemas']['Port'][];
      cables: components['schemas']['Cable'][];
      fiberCores: components['schemas']['FiberCore'][];
      fiberTerminations: components['schemas']['FiberTermination'][];
      fiberSplices: components['schemas']['FiberSplice'][];
      logicalLinks: components['schemas']['LogicalLink'][];
      powerCircuits: components['schemas']['PowerCircuit'][];
      routes: components['schemas']['RouteCorridor'][];
      cameras: components['schemas']['Camera'][];
      $defs: {
        Id: string;
        Name: string;
        /** @enum {string} */
        Layer: 'fo_ring_a' | 'fo_ring_b' | 'power_main' | 'power_backup';
        InventoryStatus: {
          /** @enum {string} */
          state: 'active' | 'inactive' | 'maintenance' | 'unknown';
          /** @enum {string} */
          source: 'inventory' | 'manual';
        };
        Site: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          name: components['schemas']['Name'];
          /** @enum {string} */
          type: 'control_center' | 'field_site' | 'substation';
          description?: string;
          status: components['schemas']['InventoryStatus'];
        };
        Device: {
          id: components['schemas']['Id'];
          siteId: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @enum {string} */
          type:
            | 'router'
            | 'switch'
            | 'otb'
            | 'odf'
            | 'splice_closure'
            | 'power_panel'
            | 'ups'
            | 'source'
            | 'junction';
          model?: components['schemas']['Name'];
          status: components['schemas']['InventoryStatus'];
        };
        Port: {
          id: components['schemas']['Id'];
          deviceId: components['schemas']['Id'];
          name: components['schemas']['Name'];
          /** @enum {string} */
          type: 'sfp' | 'fiber' | 'terminal';
          status: components['schemas']['InventoryStatus'];
        };
        Cable:
          | components['schemas']['FiberCable']
          | components['schemas']['PowerCable'];
        FiberCable: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @constant */
          kind: 'fiber';
          fromSiteId: components['schemas']['Id'];
          toSiteId: components['schemas']['Id'];
          lengthM: number;
          status: components['schemas']['InventoryStatus'];
          totalCores: number;
          /** @enum {string} */
          fiberType: 'single_mode' | 'multi_mode' | 'unknown';
        };
        PowerCable: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @constant */
          kind: 'power';
          fromSiteId: components['schemas']['Id'];
          toSiteId: components['schemas']['Id'];
          lengthM: number;
          status: components['schemas']['InventoryStatus'];
          conductorCount: number;
          crossSectionMm2: number;
          voltageV: number;
        };
        FiberCore: {
          id: components['schemas']['Id'];
          cableId: components['schemas']['Id'];
          coreNumber: number;
          /** @enum {string} */
          status: 'unallocated' | 'allocated' | 'faulty' | 'unknown';
        };
        FiberTermination: {
          id: components['schemas']['Id'];
          fiberCoreId: components['schemas']['Id'];
          portId: components['schemas']['Id'];
          /** @enum {string} */
          endSide: 'a' | 'b';
        };
        FiberSplice: {
          id: components['schemas']['Id'];
          fromFiberCoreId: components['schemas']['Id'];
          toFiberCoreId: components['schemas']['Id'];
          closureDeviceId: components['schemas']['Id'];
        };
        LogicalLink: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          fromPortId: components['schemas']['Id'];
          toPortId: components['schemas']['Id'];
          /** @enum {string} */
          routeName: 'fo_ring_a' | 'fo_ring_b';
          /** @description Ordered fiber core IDs, never a computed availability guarantee. */
          coreSegments: components['schemas']['Id'][];
        };
        PowerCircuit: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          sourcePortId: components['schemas']['Id'];
          destinationPortId: components['schemas']['Id'];
          /** @enum {string} */
          supplyType: 'pln' | 'ups' | 'backup';
          cableIds: components['schemas']['Id'][];
          status: components['schemas']['InventoryStatus'];
        };
        RouteCorridor: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          name: components['schemas']['Name'];
          cableIds: components['schemas']['Id'][];
        };
        Camera: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          siteId: components['schemas']['Id'];
          name: components['schemas']['Name'];
          enabled: boolean;
        };
        Point: {
          x: number;
          y: number;
        };
        MapNode: {
          id: components['schemas']['Id'];
          /** @enum {string} */
          entityType: 'site' | 'device';
          entityId: components['schemas']['Id'];
          x: number;
          y: number;
        };
        MapEdge: {
          id: components['schemas']['Id'];
          connectionId: components['schemas']['Id'];
          /** @enum {string} */
          connectionType:
            | 'fiber_cable_segment'
            | 'fiber_core_connection'
            | 'logical_link'
            | 'power_cable_segment'
            | 'power_circuit';
          fromNodeId: components['schemas']['Id'];
          toNodeId: components['schemas']['Id'];
          layer: components['schemas']['Layer'];
          points: components['schemas']['Point'][];
        };
        Layout: {
          width: number;
          height: number;
          nodes: components['schemas']['MapNode'][];
          edges: components['schemas']['MapEdge'][];
        };
      };
    };
    Metadata: {
      notes?: string;
      assetTag?: string;
    };
    '$defs-MapNode': {
      id: components['schemas']['Id'];
      /** @enum {string} */
      entityType: 'site' | 'device';
      entityId: components['schemas']['Id'];
      x: number;
      y: number;
      label?: components['schemas']['Name'];
      zIndex?: number;
      metadata?: components['schemas']['Metadata'];
      /** @enum {string} */
      symbol?:
        | 'site'
        | 'router'
        | 'switch'
        | 'otb'
        | 'odf'
        | 'splice_closure'
        | 'power_panel'
        | 'ups'
        | 'source'
        | 'junction'
        | 'pdu'
        | 'other';
    };
    '$defs-MapEdge': {
      id: components['schemas']['Id'];
      connectionId: components['schemas']['Id'];
      /** @enum {string} */
      connectionType:
        | 'fiber_cable_segment'
        | 'fiber_core_connection'
        | 'logical_link'
        | 'power_cable_segment'
        | 'power_circuit';
      fromNodeId: components['schemas']['Id'];
      toNodeId: components['schemas']['Id'];
      layer: components['schemas']['Layer'];
      points: components['schemas']['Point'][];
      label?: components['schemas']['Name'];
      zIndex?: number;
      metadata?: components['schemas']['Metadata'];
    };
    '$defs-Layout': {
      width: number;
      height: number;
      nodes: components['schemas']['$defs-MapNode'][];
      edges: components['schemas']['$defs-MapEdge'][];
    };
    '$defs-Site': {
      id: components['schemas']['Id'];
      code: components['schemas']['Id'];
      name: components['schemas']['Name'];
      /** @enum {string} */
      type: 'control_center' | 'field_site' | 'substation';
      description?: string;
      status: components['schemas']['InventoryStatus'];
      geography?: {
        latitude: number;
        longitude: number;
      };
      metadata?: components['schemas']['Metadata'];
    };
    '$defs-Device': {
      id: components['schemas']['Id'];
      siteId: components['schemas']['Id'];
      code: components['schemas']['Id'];
      /** @enum {string} */
      type:
        | 'router'
        | 'switch'
        | 'otb'
        | 'odf'
        | 'splice_closure'
        | 'power_panel'
        | 'ups'
        | 'source'
        | 'junction'
        | 'pdu'
        | 'other';
      model?: components['schemas']['Name'];
      status: components['schemas']['InventoryStatus'];
    };
    /**
     * SENKOM published map v2
     * @description Public snapshot only. No credentials, playback tokens, management IPs, or inferred connectivity.
     */
    'published-map.v2': {
      /** @constant */
      schemaVersion: 2;
      revision: components['schemas']['Id'];
      /** Format: date-time */
      publishedAt: string;
      /** @constant */
      status: 'published';
      /** @enum {string} */
      dataOrigin: 'demo' | 'production';
      demoLabel?: string;
      layout: components['schemas']['$defs-Layout'];
      layers: components['schemas']['Layer'][];
      sites: components['schemas']['$defs-Site'][];
      devices: components['schemas']['$defs-Device'][];
      ports: components['schemas']['Port'][];
      cables: components['schemas']['Cable'][];
      fiberCores: components['schemas']['FiberCore'][];
      fiberTerminations: components['schemas']['FiberTermination'][];
      fiberSplices: components['schemas']['FiberSplice'][];
      logicalLinks: components['schemas']['LogicalLink'][];
      powerCircuits: components['schemas']['PowerCircuit'][];
      routes: components['schemas']['RouteCorridor'][];
      cameras: components['schemas']['Camera'][];
      mapId: components['schemas']['Id'];
      $defs: {
        Id: string;
        Name: string;
        /** @enum {string} */
        Layer: 'fo_ring_a' | 'fo_ring_b' | 'power_main' | 'power_backup';
        InventoryStatus: {
          /** @enum {string} */
          state: 'active' | 'inactive' | 'maintenance' | 'unknown';
          /** @enum {string} */
          source: 'inventory' | 'manual';
        };
        Site: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          name: components['schemas']['Name'];
          /** @enum {string} */
          type: 'control_center' | 'field_site' | 'substation';
          description?: string;
          status: components['schemas']['InventoryStatus'];
          geography?: {
            latitude: number;
            longitude: number;
          };
          metadata?: components['schemas']['Metadata'];
        };
        Device: {
          id: components['schemas']['Id'];
          siteId: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @enum {string} */
          type:
            | 'router'
            | 'switch'
            | 'otb'
            | 'odf'
            | 'splice_closure'
            | 'power_panel'
            | 'ups'
            | 'source'
            | 'junction'
            | 'pdu'
            | 'other';
          model?: components['schemas']['Name'];
          status: components['schemas']['InventoryStatus'];
        };
        Port: {
          id: components['schemas']['Id'];
          deviceId: components['schemas']['Id'];
          name: components['schemas']['Name'];
          /** @enum {string} */
          type: 'sfp' | 'fiber' | 'terminal';
          status: components['schemas']['InventoryStatus'];
        };
        Cable:
          | components['schemas']['FiberCable']
          | components['schemas']['PowerCable'];
        FiberCable: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @constant */
          kind: 'fiber';
          fromSiteId: components['schemas']['Id'];
          toSiteId: components['schemas']['Id'];
          lengthM: number;
          status: components['schemas']['InventoryStatus'];
          totalCores: number;
          /** @enum {string} */
          fiberType: 'single_mode' | 'multi_mode' | 'unknown';
        };
        PowerCable: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @constant */
          kind: 'power';
          fromSiteId: components['schemas']['Id'];
          toSiteId: components['schemas']['Id'];
          lengthM: number;
          status: components['schemas']['InventoryStatus'];
          conductorCount: number;
          crossSectionMm2: number;
          voltageV: number;
        };
        FiberCore: {
          id: components['schemas']['Id'];
          cableId: components['schemas']['Id'];
          coreNumber: number;
          /** @enum {string} */
          status: 'unallocated' | 'allocated' | 'faulty' | 'unknown';
        };
        FiberTermination: {
          id: components['schemas']['Id'];
          fiberCoreId: components['schemas']['Id'];
          portId: components['schemas']['Id'];
          /** @enum {string} */
          endSide: 'a' | 'b';
        };
        FiberSplice: {
          id: components['schemas']['Id'];
          fromFiberCoreId: components['schemas']['Id'];
          toFiberCoreId: components['schemas']['Id'];
          closureDeviceId: components['schemas']['Id'];
        };
        LogicalLink: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          fromPortId: components['schemas']['Id'];
          toPortId: components['schemas']['Id'];
          /** @enum {string} */
          routeName: 'fo_ring_a' | 'fo_ring_b';
          /** @description Ordered fiber core IDs, never a computed availability guarantee. */
          coreSegments: components['schemas']['Id'][];
        };
        PowerCircuit: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          sourcePortId: components['schemas']['Id'];
          destinationPortId: components['schemas']['Id'];
          /** @enum {string} */
          supplyType: 'pln' | 'ups' | 'backup';
          cableIds: components['schemas']['Id'][];
          status: components['schemas']['InventoryStatus'];
        };
        RouteCorridor: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          name: components['schemas']['Name'];
          cableIds: components['schemas']['Id'][];
        };
        Camera: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          siteId: components['schemas']['Id'];
          name: components['schemas']['Name'];
          enabled: boolean;
        };
        Point: {
          x: number;
          y: number;
        };
        MapNode: {
          id: components['schemas']['Id'];
          /** @enum {string} */
          entityType: 'site' | 'device';
          entityId: components['schemas']['Id'];
          x: number;
          y: number;
          label?: components['schemas']['Name'];
          zIndex?: number;
          metadata?: components['schemas']['Metadata'];
          /** @enum {string} */
          symbol?:
            | 'site'
            | 'router'
            | 'switch'
            | 'otb'
            | 'odf'
            | 'splice_closure'
            | 'power_panel'
            | 'ups'
            | 'source'
            | 'junction'
            | 'pdu'
            | 'other';
        };
        MapEdge: {
          id: components['schemas']['Id'];
          connectionId: components['schemas']['Id'];
          /** @enum {string} */
          connectionType:
            | 'fiber_cable_segment'
            | 'fiber_core_connection'
            | 'logical_link'
            | 'power_cable_segment'
            | 'power_circuit';
          fromNodeId: components['schemas']['Id'];
          toNodeId: components['schemas']['Id'];
          layer: components['schemas']['Layer'];
          points: components['schemas']['Point'][];
          label?: components['schemas']['Name'];
          zIndex?: number;
          metadata?: components['schemas']['Metadata'];
        };
        Layout: {
          width: number;
          height: number;
          nodes: components['schemas']['$defs-MapNode'][];
          edges: components['schemas']['$defs-MapEdge'][];
        };
        Metadata: {
          notes?: string;
          assetTag?: string;
        };
      };
    };
    /**
     * SENKOM editable map content v2
     * @description Public snapshot only. No credentials, playback tokens, management IPs, or inferred connectivity.
     */
    'map-content.v2': {
      /** @constant */
      schemaVersion: 2;
      /** @enum {string} */
      dataOrigin: 'demo' | 'production';
      demoLabel?: string;
      layout: components['schemas']['$defs-Layout'];
      layers: components['schemas']['Layer'][];
      sites: components['schemas']['$defs-Site'][];
      devices: components['schemas']['$defs-Device'][];
      ports: components['schemas']['Port'][];
      cables: components['schemas']['Cable'][];
      fiberCores: components['schemas']['FiberCore'][];
      fiberTerminations: components['schemas']['FiberTermination'][];
      fiberSplices: components['schemas']['FiberSplice'][];
      logicalLinks: components['schemas']['LogicalLink'][];
      powerCircuits: components['schemas']['PowerCircuit'][];
      routes: components['schemas']['RouteCorridor'][];
      cameras: components['schemas']['Camera'][];
      $defs: {
        Id: string;
        Name: string;
        /** @enum {string} */
        Layer: 'fo_ring_a' | 'fo_ring_b' | 'power_main' | 'power_backup';
        InventoryStatus: {
          /** @enum {string} */
          state: 'active' | 'inactive' | 'maintenance' | 'unknown';
          /** @enum {string} */
          source: 'inventory' | 'manual';
        };
        Site: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          name: components['schemas']['Name'];
          /** @enum {string} */
          type: 'control_center' | 'field_site' | 'substation';
          description?: string;
          status: components['schemas']['InventoryStatus'];
          geography?: {
            latitude: number;
            longitude: number;
          };
          metadata?: components['schemas']['Metadata'];
        };
        Device: {
          id: components['schemas']['Id'];
          siteId: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @enum {string} */
          type:
            | 'router'
            | 'switch'
            | 'otb'
            | 'odf'
            | 'splice_closure'
            | 'power_panel'
            | 'ups'
            | 'source'
            | 'junction'
            | 'pdu'
            | 'other';
          model?: components['schemas']['Name'];
          status: components['schemas']['InventoryStatus'];
        };
        Port: {
          id: components['schemas']['Id'];
          deviceId: components['schemas']['Id'];
          name: components['schemas']['Name'];
          /** @enum {string} */
          type: 'sfp' | 'fiber' | 'terminal';
          status: components['schemas']['InventoryStatus'];
        };
        Cable:
          | components['schemas']['FiberCable']
          | components['schemas']['PowerCable'];
        FiberCable: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @constant */
          kind: 'fiber';
          fromSiteId: components['schemas']['Id'];
          toSiteId: components['schemas']['Id'];
          lengthM: number;
          status: components['schemas']['InventoryStatus'];
          totalCores: number;
          /** @enum {string} */
          fiberType: 'single_mode' | 'multi_mode' | 'unknown';
        };
        PowerCable: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          /** @constant */
          kind: 'power';
          fromSiteId: components['schemas']['Id'];
          toSiteId: components['schemas']['Id'];
          lengthM: number;
          status: components['schemas']['InventoryStatus'];
          conductorCount: number;
          crossSectionMm2: number;
          voltageV: number;
        };
        FiberCore: {
          id: components['schemas']['Id'];
          cableId: components['schemas']['Id'];
          coreNumber: number;
          /** @enum {string} */
          status: 'unallocated' | 'allocated' | 'faulty' | 'unknown';
        };
        FiberTermination: {
          id: components['schemas']['Id'];
          fiberCoreId: components['schemas']['Id'];
          portId: components['schemas']['Id'];
          /** @enum {string} */
          endSide: 'a' | 'b';
        };
        FiberSplice: {
          id: components['schemas']['Id'];
          fromFiberCoreId: components['schemas']['Id'];
          toFiberCoreId: components['schemas']['Id'];
          closureDeviceId: components['schemas']['Id'];
        };
        LogicalLink: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          fromPortId: components['schemas']['Id'];
          toPortId: components['schemas']['Id'];
          /** @enum {string} */
          routeName: 'fo_ring_a' | 'fo_ring_b';
          /** @description Ordered fiber core IDs, never a computed availability guarantee. */
          coreSegments: components['schemas']['Id'][];
        };
        PowerCircuit: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          sourcePortId: components['schemas']['Id'];
          destinationPortId: components['schemas']['Id'];
          /** @enum {string} */
          supplyType: 'pln' | 'ups' | 'backup';
          cableIds: components['schemas']['Id'][];
          status: components['schemas']['InventoryStatus'];
        };
        RouteCorridor: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          name: components['schemas']['Name'];
          cableIds: components['schemas']['Id'][];
        };
        Camera: {
          id: components['schemas']['Id'];
          code: components['schemas']['Id'];
          siteId: components['schemas']['Id'];
          name: components['schemas']['Name'];
          enabled: boolean;
        };
        Point: {
          x: number;
          y: number;
        };
        MapNode: {
          id: components['schemas']['Id'];
          /** @enum {string} */
          entityType: 'site' | 'device';
          entityId: components['schemas']['Id'];
          x: number;
          y: number;
          label?: components['schemas']['Name'];
          zIndex?: number;
          metadata?: components['schemas']['Metadata'];
          /** @enum {string} */
          symbol?:
            | 'site'
            | 'router'
            | 'switch'
            | 'otb'
            | 'odf'
            | 'splice_closure'
            | 'power_panel'
            | 'ups'
            | 'source'
            | 'junction'
            | 'pdu'
            | 'other';
        };
        MapEdge: {
          id: components['schemas']['Id'];
          connectionId: components['schemas']['Id'];
          /** @enum {string} */
          connectionType:
            | 'fiber_cable_segment'
            | 'fiber_core_connection'
            | 'logical_link'
            | 'power_cable_segment'
            | 'power_circuit';
          fromNodeId: components['schemas']['Id'];
          toNodeId: components['schemas']['Id'];
          layer: components['schemas']['Layer'];
          points: components['schemas']['Point'][];
          label?: components['schemas']['Name'];
          zIndex?: number;
          metadata?: components['schemas']['Metadata'];
        };
        Layout: {
          width: number;
          height: number;
          nodes: components['schemas']['$defs-MapNode'][];
          edges: components['schemas']['$defs-MapEdge'][];
        };
        Metadata: {
          notes?: string;
          assetTag?: string;
        };
      };
    };
  };
  responses: {
    /** @description Authentication required */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Role not allowed */
    Forbidden: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description No published resource */
    NotFound: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Service unavailable; retain validated local snapshot */
    Unavailable: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  getHealth: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description API process responds */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HealthResponse'];
        };
      };
    };
  };
  getPublishedMap: {
    parameters: {
      query?: {
        /** @description v1 projection remains available when the active revision is representable. Otherwise 406; retain prior compatible cache. */
        schemaVersion?: 1 | 2;
      };
      header?: {
        'If-None-Match'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Published map */
      200: {
        headers: {
          ETag?: string;
          /** @description SHA-256 of exact UTF-8 response body bytes. */
          'X-Content-SHA256'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['MapResponse']
            | components['schemas']['MapResponseV2'];
        };
      };
      /** @description Unchanged representation; no body */
      304: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
      404: components['responses']['NotFound'];
      /** @description Unsupported or incompatible schema */
      406: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      503: components['responses']['Unavailable'];
    };
  };
  getViewerCameras: {
    parameters: {
      query?: {
        /** @description v1 projection remains available when the active revision is representable. Otherwise 406; retain prior compatible cache. */
        schemaVersion?: 1 | 2;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Camera inventory, not playback sessions */
      200: {
        headers: {
          ETag?: string;
          /** @description SHA-256 of exact UTF-8 response body bytes. */
          'X-Content-SHA256'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                data: components['schemas']['Camera'][];
                meta: components['schemas']['Meta'];
              }
            | {
                data: components['schemas']['Camera'][];
                meta: components['schemas']['MetaV2'];
              };
        };
      };
      /** @description Unchanged representation; no body */
      304: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
      /** @description Unsupported or incompatible schema */
      406: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      503: components['responses']['Unavailable'];
    };
  };
  getVersionPolicy: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Maintenance policy; this response is not an updater artifact manifest */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            data: components['schemas']['ReleasePolicy'];
            meta: components['schemas']['Meta'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getAdminSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminSession'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  loginAdmin: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** Format: email */
          email: string;
          password: string;
        };
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminSession'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  logoutAdmin: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminSession'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getDraft: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  saveDraft: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['map-content.v2'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  validateDraft: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ValidationResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  publishDraft: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PublicationResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  rollbackMap: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** Format: uuid */
          revisionId: string;
        };
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listRevisions: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RevisionListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getRevision: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MapResponseV2'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listAuditLogs: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AuditListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getLayout: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          /** @description Current draft ETag for If-Match on layout PUT, e.g. "draft:1". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LayoutResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  saveLayout: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-Layout'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listSite: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createSite: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-Site'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getSite: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceSite: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-Site'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteSite: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateSite: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SitePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listDevice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DeviceListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createDevice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-Device'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getDevice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DeviceResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceDevice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-Device'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteDevice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateDevice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DevicePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listPort: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PortListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createPort: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Port'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getPort: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PortResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replacePort: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Port'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deletePort: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updatePort: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PortPatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listCable: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CableListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createCable: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Cable'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getCable: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CableResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceCable: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Cable'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteCable: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateCable: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CablePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listFiberCore: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FiberCoreListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createFiberCore: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberCore'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getFiberCore: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FiberCoreResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceFiberCore: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberCore'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteFiberCore: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateFiberCore: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberCorePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listFiberTermination: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FiberTerminationListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createFiberTermination: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberTermination'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getFiberTermination: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FiberTerminationResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceFiberTermination: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberTermination'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteFiberTermination: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateFiberTermination: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberTerminationPatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listFiberSplice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FiberSpliceListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createFiberSplice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberSplice'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getFiberSplice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FiberSpliceResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceFiberSplice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberSplice'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteFiberSplice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateFiberSplice: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FiberSplicePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listLogicalLink: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LogicalLinkListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createLogicalLink: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LogicalLink'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getLogicalLink: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LogicalLinkResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceLogicalLink: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LogicalLink'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteLogicalLink: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateLogicalLink: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LogicalLinkPatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listPowerCircuit: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PowerCircuitListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createPowerCircuit: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PowerCircuit'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getPowerCircuit: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PowerCircuitResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replacePowerCircuit: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PowerCircuit'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deletePowerCircuit: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updatePowerCircuit: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PowerCircuitPatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listRouteCorridor: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RouteCorridorListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createRouteCorridor: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RouteCorridor'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getRouteCorridor: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RouteCorridorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceRouteCorridor: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RouteCorridor'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteRouteCorridor: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateRouteCorridor: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RouteCorridorPatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listCamera: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CameraListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createCamera: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Camera'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getCamera: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CameraResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceCamera: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Camera'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteCamera: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateCamera: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CameraPatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listMapNode: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MapNodeListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createMapNode: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-MapNode'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getMapNode: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MapNodeResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceMapNode: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-MapNode'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteMapNode: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateMapNode: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MapNodePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  listMapEdge: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
        page?: number;
        perPage?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MapEdgeListResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createMapEdge: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-MapEdge'];
      };
    };
    responses: {
      /** @description Success */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getMapEdge: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MapEdgeResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  replaceMapEdge: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['$defs-MapEdge'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteMapEdge: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateMapEdge: {
    parameters: {
      query?: {
        /** @description Configured default map when omitted; administrators may select an existing map. */
        mapId?: string;
      };
      header: {
        /** @description Exact draft ETag, e.g. "draft:1". Stale value returns 409; missing returns 428. */
        'If-Match': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MapEdgePatch'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DraftResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getViewerSite: {
    parameters: {
      query?: {
        /** @description v1 projection remains available when the active revision is representable. Otherwise 406; retain prior compatible cache. */
        schemaVersion?: 1 | 2;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Published inventory only */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                data: components['schemas']['Site'];
                meta: components['schemas']['Meta'];
              }
            | {
                data: components['schemas']['$defs-Site'];
                meta: components['schemas']['MetaV2'];
              };
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getViewerCable: {
    parameters: {
      query?: {
        /** @description v1 projection remains available when the active revision is representable. Otherwise 406; retain prior compatible cache. */
        schemaVersion?: 1 | 2;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Published inventory only */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                data: components['schemas']['Cable'];
                meta: components['schemas']['Meta'];
              }
            | {
                data: components['schemas']['Cable'];
                meta: components['schemas']['MetaV2'];
              };
        };
      };
      /** @description Rejected request; no partial mutation */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      415: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      419: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Rejected request; no partial mutation */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
}
