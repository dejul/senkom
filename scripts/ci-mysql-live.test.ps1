$ErrorActionPreference = 'Stop'
$artifacts = (Resolve-Path (Join-Path $PSScriptRoot '../.artifacts')).Path
$runId = [guid]::NewGuid().ToString('N')
$runDir = Join-Path $artifacts "ci-mysql-$runId"
$envFile = Join-Path $artifacts "mysql-live-$runId.env"
$archive = Join-Path $artifacts 'mysql-8.4.11-winx64.zip'
if (-not (Test-Path -LiteralPath $archive)) { throw 'Pinned MySQL archive unavailable.' }
$previousGithubEnv = $env:GITHUB_ENV
$env:GITHUB_ENV = $envFile
$failed = $false
try {
    & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action start -RunId $runId -ArchivePath $archive
    if (-not (Test-Path -LiteralPath (Join-Path $runDir 'process.json'))) { throw 'Process identity missing.' }
    Write-Output 'PASS actual owned MySQL start and process capture.'
    & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId ([guid]::NewGuid().ToString('N'))
    $identity = Get-Content -LiteralPath (Join-Path $runDir 'process.json') -Raw | ConvertFrom-Json
    if (-not (Get-CimInstance Win32_Process -Filter "ProcessId = $($identity.pid)")) { throw 'Foreign stop affected owned MySQL process.' }
    Write-Output 'PASS foreign run identity cannot stop active database.'
} catch {
    $failed = $true
    [Console]::Error.WriteLine($_)
} finally {
    try {
        & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $runId
        if (Test-Path -LiteralPath $runDir) { throw 'Owned MySQL directory remains.' }
        Write-Output 'PASS actual owned MySQL cleanup.'
    } catch {
        $failed = $true
        [Console]::Error.WriteLine($_)
    }
    if (Test-Path -LiteralPath $envFile) { [IO.File]::Delete($envFile) }
    $env:GITHUB_ENV = $previousGithubEnv
}
if ($failed) { exit 1 }
