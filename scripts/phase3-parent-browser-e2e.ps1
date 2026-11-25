param([string] $ArchivePath)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$envFile = Join-Path $root '.artifacts/parent3-02-env'
if (-not $ArchivePath -and (Test-Path -LiteralPath (Join-Path $root '.artifacts/mysql-8.4.11-winx64.zip'))) {
    $ArchivePath = Join-Path $root '.artifacts/mysql-8.4.11-winx64.zip'
}
if (Test-Path -LiteralPath $envFile) { throw 'Parent E2E environment file already exists.' }
$previousGithubEnv = $env:GITHUB_ENV
$previousPhp = $env:SENKOM_PHP_BINARY
$runId = [guid]::NewGuid().ToString('N')
$env:GITHUB_ENV = $envFile
$runDir = Join-Path $root ".artifacts/ci-mysql-$runId"
$exitCode = 0
$nodePassed = $false
$mysqlStopped = $false
try {
    & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action start -ArchivePath $ArchivePath -RunId $runId
    if ($LASTEXITCODE -ne 0) { throw 'Disposable MySQL startup failed.' }
    foreach ($line in Get-Content -LiteralPath $envFile) {
        $pair = $line.Split('=', 2)
        [Environment]::SetEnvironmentVariable($pair[0], $pair[1], 'Process')
    }
    $env:SENKOM_TEST_DB_DATABASE = 'senkom_ci_http_test'
    if (-not $env:SENKOM_PHP_BINARY) {
        $localPhp = 'C:\laragon\bin\php\php-8.4.26-Win32-vs17-x64\php.exe'
        $env:SENKOM_PHP_BINARY = if (Test-Path -LiteralPath $localPhp) { $localPhp } else { 'php' }
    }
    if (-not $env:FFMPEG_PATH) { throw 'Set FFMPEG_PATH to trusted synthetic lab FFmpeg.' }
    & node (Join-Path $PSScriptRoot 'phase3-parent-browser-e2e.mjs')
    if ($LASTEXITCODE -ne 0) { throw "Parent integrated E2E exited $LASTEXITCODE" }
    $nodePassed = $true
} catch {
    [Console]::Error.WriteLine($_)
    $exitCode = 1
} finally {
    try {
        if ($nodePassed -and -not (Test-Path -LiteralPath $runDir)) { throw 'Owned MySQL directory disappeared before cleanup.' }
        & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop -RunId $runId
        if (Test-Path -LiteralPath $runDir) { throw 'Owned MySQL directory remains after cleanup.' }
        if ($env:SENKOM_PARENT_TEST_FAIL_AFTER_CLEANUP -eq '1') { throw 'Injected post-cleanup verification failure.' }
        $mysqlStopped = $true
    } catch {
        [Console]::Error.WriteLine($_)
        $exitCode = 1
    }
    finally {
        Remove-Item -LiteralPath $envFile -ErrorAction SilentlyContinue
        $env:GITHUB_ENV = $previousGithubEnv
        $env:SENKOM_PHP_BINARY = $previousPhp
        Remove-Item Env:SENKOM_TEST_DB_DATABASE, Env:SENKOM_TEST_DB_PORT, Env:SENKOM_TEST_DB_USERNAME, Env:SENKOM_TEST_DB_PASSWORD, Env:APP_KEY -ErrorAction SilentlyContinue
    }
}
if ($nodePassed -and $mysqlStopped -and $exitCode -eq 0) { Write-Output 'PASS PARENT 3-02 INTEGRATED E2E' }
exit $exitCode
