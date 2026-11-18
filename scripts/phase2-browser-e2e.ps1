param([string] $ArchivePath)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$envFile = Join-Path $root '.artifacts/browser-e2e-env'
$stdout = Join-Path $root '.artifacts/browser-e2e-stdout.log'
$stderr = Join-Path $root '.artifacts/browser-e2e-stderr.log'
if (-not $ArchivePath -and (Test-Path -LiteralPath (Join-Path $root '.artifacts/mysql-8.4.11-winx64.zip'))) {
    $ArchivePath = Join-Path $root '.artifacts/mysql-8.4.11-winx64.zip'
}
if (Test-Path -LiteralPath $envFile) { throw 'Browser E2E environment file already exists.' }
$previousGithubEnv = $env:GITHUB_ENV
$previousRunAsNode = $env:ELECTRON_RUN_AS_NODE
$previousPhp = $env:SENKOM_PHP_BINARY
$env:GITHUB_ENV = $envFile
$exitCode = 0
try {
    & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action start -ArchivePath $ArchivePath
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
    Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
    $browser = Start-Process -FilePath (Join-Path $root 'node_modules/electron/dist/electron.exe') -ArgumentList (Join-Path $PSScriptRoot 'phase2-browser-e2e.cjs') -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    Get-Content -LiteralPath $stdout -ErrorAction SilentlyContinue
    Get-Content -LiteralPath $stderr -ErrorAction SilentlyContinue
    if ($browser.ExitCode -ne 0) { throw "Real API browser E2E failed: exit $($browser.ExitCode)" }
} catch {
    [Console]::Error.WriteLine($_)
    $exitCode = 1
} finally {
    try { & (Join-Path $PSScriptRoot 'ci-mysql.ps1') -Action stop }
    finally {
        Remove-Item -LiteralPath $envFile -ErrorAction SilentlyContinue
        $env:GITHUB_ENV = $previousGithubEnv
        $env:ELECTRON_RUN_AS_NODE = $previousRunAsNode
        $env:SENKOM_PHP_BINARY = $previousPhp
        Remove-Item Env:SENKOM_TEST_DB_DATABASE, Env:SENKOM_TEST_DB_PORT, Env:SENKOM_TEST_DB_USERNAME, Env:SENKOM_TEST_DB_PASSWORD, Env:APP_KEY -ErrorAction SilentlyContinue
    }
}
exit $exitCode
