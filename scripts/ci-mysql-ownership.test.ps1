$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ci-mysql-ownership.ps1')
$artifacts = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path '.artifacts'
New-Item -ItemType Directory -Path $artifacts -Force | Out-Null
$checks = 0
function Check([bool] $condition, [string] $name) {
    if (-not $condition) { throw "FAIL $name" }
    $script:checks++
    Write-Output "PASS $name"
}
function Reject([scriptblock] $operation, [string] $name) {
    $rejected = $false
    try { & $operation | Out-Null } catch { $rejected = $true }
    Check $rejected $name
}
function OwnedDirectory([string] $id, [string] $owner = $id) {
    $path = Join-Path $artifacts "ci-mysql-$id"
    New-Item -ItemType Directory -Path $path -ErrorAction Stop | Out-Null
    @{ kind = 'SENKOM disposable MySQL v2'; runId = $owner } | ConvertTo-Json -Compress |
        Set-Content -LiteralPath (Join-Path $path '.ci-mysql-owned') -NoNewline
    Set-Content -LiteralPath (Join-Path $path 'sentinel') -Value 'foreign data'
    return $path
}
function FreshId { return [guid]::NewGuid().ToString('N') }

$foreignId = FreshId
$foreign = OwnedDirectory $foreignId (FreshId)
Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $foreignId } 'foreign owner rejected'
Check ((Get-Content (Join-Path $foreign 'sentinel') -Raw).Trim() -eq 'foreign data') 'foreign sentinel preserved'

$missingId = FreshId
$missing = OwnedDirectory $missingId
Remove-Item -LiteralPath (Join-Path $missing '.ci-mysql-owned')
Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $missingId } 'missing marker rejected'
Set-Content -LiteralPath (Join-Path $missing '.ci-mysql-owned') -Value '{bad'
Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $missingId } 'malformed marker rejected'
Check (Test-Path -LiteralPath (Join-Path $missing 'sentinel')) 'missing and malformed marker preserve data'

$collisionId = FreshId
$collision = OwnedDirectory $collisionId
Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action start -RunId $collisionId -ArchivePath 'unused' } 'existing ownership claim rejected before startup'
Check (Test-Path -LiteralPath (Join-Path $collision 'sentinel')) 'concurrent claim preserves data'

$processId = FreshId
$processPath = OwnedDirectory $processId
@{ runId = $processId; pid = $PID; startTicks = 0; executable = 'foreign.exe'; port = 1 } |
    ConvertTo-Json -Compress | Set-Content -LiteralPath (Join-Path $processPath 'process.json')
Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $processId } 'stale or foreign process identity rejected'
Check (Test-Path -LiteralPath (Join-Path $processPath 'sentinel')) 'foreign process sentinel preserved'

$partialId = FreshId
$partial = OwnedDirectory $partialId
& (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $partialId | Out-Null
Check (-not (Test-Path -LiteralPath $partial)) 'partial owned startup cleaned'
& (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $partialId | Out-Null
Check (-not (Test-Path -LiteralPath $partial)) 'repeated owned cleanup idempotent'

$outsideId = FreshId
Reject { Assert-CiMysqlPath $artifacts (Join-Path $artifacts 'not-ci-mysql') $outsideId } 'unexpected path rejected'
Reject { Assert-CiMysqlPath $artifacts (Join-Path $artifacts 'ci-mysql-../../escape') $outsideId } 'traversal rejected'
Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId '../escape' } 'invalid run identity rejected'

$linkId = FreshId
$linkRun = OwnedDirectory $linkId
$linkTarget = Join-Path $artifacts "sentinel-$linkId"
New-Item -ItemType Directory -Path $linkTarget | Out-Null
Set-Content -LiteralPath (Join-Path $linkTarget 'sentinel') -Value 'outside data'
$link = Join-Path $linkRun 'outside-link'
try {
    New-Item -ItemType Junction -Path $link -Target $linkTarget -ErrorAction Stop | Out-Null
    Reject { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $linkId } 'reparse point rejected'
    Check ((Get-Content -LiteralPath (Join-Path $linkTarget 'sentinel') -Raw).Trim() -eq 'outside data') 'reparse target preserved'
} finally {
    if (Test-Path -LiteralPath $link) { [IO.Directory]::Delete($link) }
}

foreach ($path in @($foreign, $missing, $collision, $processPath, $linkRun)) {
    if (Test-Path -LiteralPath $path) {
        $id = [IO.Path]::GetFileName($path).Substring('ci-mysql-'.Length)
        Assert-CiMysqlPath $artifacts $path $id $true
        Remove-Item -LiteralPath $path -Recurse -Force
    }
}
if ([string]::Equals([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($linkTarget)), [IO.Path]::GetFullPath($artifacts), [StringComparison]::OrdinalIgnoreCase)) {
    Remove-Item -LiteralPath $linkTarget -Recurse -Force
}
Write-Output "PASS $checks ownership safety checks"
