param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('start', 'stop')]
    [string] $Action,
    [string] $ArchivePath
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$artifacts = [IO.Path]::GetFullPath((Join-Path $root '.artifacts'))
$runDir = [IO.Path]::GetFullPath((Join-Path $artifacts 'ci-mysql'))
$marker = Join-Path $runDir '.ci-mysql-owned'
$data = Join-Path $runDir 'data'
$portFile = Join-Path $runDir 'port'
$pidFile = Join-Path $runDir 'pid'
$version = '8.4.11'
$sha256 = 'A492371D687D2BAB088B0062581144A0044B8964BAEFDF4FAA579292B423D25C'

if ($Action -eq 'stop') {
    if (-not (Test-Path -LiteralPath $marker)) { return }
    if (-not $runDir.StartsWith($artifacts + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Refusing cleanup outside repository artifacts.'
    }
    if (Test-Path -LiteralPath $pidFile) {
        $serverPid = [int](Get-Content -LiteralPath $pidFile -Raw)
        $server = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid"
        if ($server) {
            if (-not $server.CommandLine.Contains($data)) { throw 'Refusing to stop unrelated MySQL process.' }
            $mysqladmin = Join-Path $runDir "mysql-$version-winx64\bin\mysqladmin.exe"
            $port = [int](Get-Content -LiteralPath $portFile -Raw)
            & $mysqladmin --no-defaults --protocol=TCP --host=127.0.0.1 "--port=$port" --user=root shutdown
            if ($LASTEXITCODE -ne 0) { throw 'MySQL shutdown failed.' }
            for ($i = 0; $i -lt 30 -and (Get-Process -Id $serverPid -ErrorAction SilentlyContinue); $i++) {
                Start-Sleep -Seconds 1
            }
            if (Get-Process -Id $serverPid -ErrorAction SilentlyContinue) { throw 'MySQL process still running.' }
        }
    }
    Remove-Item -LiteralPath $runDir -Recurse -Force
    Write-Output 'Disposable MySQL stopped and removed.'
    return
}

if (Test-Path -LiteralPath $runDir) { throw 'Disposable MySQL directory already exists.' }
New-Item -ItemType Directory -Path $runDir -Force | Out-Null
Set-Content -LiteralPath $marker -Value 'SENKOM CI disposable MySQL' -NoNewline
if (-not $ArchivePath) {
    $ArchivePath = Join-Path $runDir "mysql-$version-winx64.zip"
    & curl.exe -fsSL --retry 3 --output $ArchivePath "https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-$version-winx64.zip"
    if ($LASTEXITCODE -ne 0) { throw 'MySQL download failed.' }
}
if ((Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash -ne $sha256) { throw 'MySQL archive checksum mismatch.' }
Expand-Archive -LiteralPath $ArchivePath -DestinationPath $runDir
$base = Join-Path $runDir "mysql-$version-winx64"
$mysqld = Join-Path $base 'bin\mysqld.exe'
$mysql = Join-Path $base 'bin\mysql.exe'
$mysqladmin = Join-Path $base 'bin\mysqladmin.exe'
if (-not (Test-Path -LiteralPath $mysqld)) { throw 'MySQL executable missing.' }
if ((& $mysqld --version) -notmatch "Ver $version") { throw 'Wrong MySQL version.' }
& $mysqld --no-defaults --initialize-insecure "--basedir=$base" "--datadir=$data" --console
if ($LASTEXITCODE -ne 0) { throw 'MySQL initialization failed.' }

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$listener.Start()
$port = $listener.LocalEndpoint.Port
$listener.Stop()
Set-Content -LiteralPath $portFile -Value $port -NoNewline
$server = Start-Process -FilePath $mysqld -ArgumentList @('--no-defaults', "--basedir=$base", "--datadir=$data", '--bind-address=127.0.0.1', "--port=$port", '--mysqlx=OFF', '--skip-log-bin', "--log-error=$(Join-Path $runDir 'mysql-error.log')") -WindowStyle Hidden -PassThru
Set-Content -LiteralPath $pidFile -Value $server.Id -NoNewline
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    & $mysqladmin --no-defaults --protocol=TCP --host=127.0.0.1 "--port=$port" --user=root ping 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    if ($server.HasExited) { throw 'MySQL exited before readiness.' }
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'MySQL readiness timeout.' }
$rootArgs = @('--no-defaults', '--protocol=TCP', '--host=127.0.0.1', "--port=$port", '--user=root', '--batch', '--raw', '--skip-column-names')
$identity = (& $mysql @rootArgs --execute='SELECT @@version, @@port, @@datadir').Split("`t")
if ($LASTEXITCODE -ne 0 -or $identity.Count -ne 3 -or $identity[0] -ne $version -or [int]$identity[1] -ne $port -or $identity[2].Replace('\', '/').TrimEnd('/') -ine $data.Replace('\', '/').TrimEnd('/')) {
    throw 'MySQL identity mismatch.'
}
& $mysql @rootArgs --execute='CREATE DATABASE senkom_ci_setup_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs; CREATE DATABASE senkom_ci_unit_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs; CREATE DATABASE senkom_ci_http_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs'
if ($LASTEXITCODE -ne 0) { throw 'CI database creation failed.' }

$bytes = New-Object byte[] 24
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$random.GetBytes($bytes)
$random.Dispose()
$password = -join ($bytes | ForEach-Object { $_.ToString('x2') })
$sql = "CREATE USER 'senkom_ci'@'127.0.0.1' IDENTIFIED BY '$password'; GRANT ALL PRIVILEGES ON senkom_ci_setup_test.* TO 'senkom_ci'@'127.0.0.1'; GRANT ALL PRIVILEGES ON senkom_ci_unit_test.* TO 'senkom_ci'@'127.0.0.1'; GRANT ALL PRIVILEGES ON senkom_ci_http_test.* TO 'senkom_ci'@'127.0.0.1';"
$sql | & $mysql @rootArgs
if ($LASTEXITCODE -ne 0) { throw 'CI database user creation failed.' }
$env:MYSQL_PWD = $password
try {
    & $mysql --no-defaults --protocol=TCP --host=127.0.0.1 "--port=$port" --user=senkom_ci --database=senkom_ci_setup_test --batch --skip-column-names --execute='SELECT DATABASE()' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'CI database user login failed.' }
} finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}
if (-not $env:GITHUB_ENV) { throw 'GITHUB_ENV path required.' }
if ($env:GITHUB_ACTIONS -eq 'true') { Write-Output "::add-mask::$password" }
$keyBytes = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$random.GetBytes($keyBytes)
$random.Dispose()
$key = 'base64:' + [Convert]::ToBase64String($keyBytes)
if ($env:GITHUB_ACTIONS -eq 'true') { Write-Output "::add-mask::$key" }
$lines = @("SENKOM_TEST_DB_PORT=$port", 'SENKOM_TEST_DB_USERNAME=senkom_ci', "SENKOM_TEST_DB_PASSWORD=$password", "APP_KEY=$key")
[IO.File]::AppendAllText($env:GITHUB_ENV, ($lines -join "`n") + "`n", (New-Object Text.UTF8Encoding($false)))
Write-Output "MySQL $version ready on loopback port $port with three disposable databases."
