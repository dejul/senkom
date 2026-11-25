param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('start', 'stop')]
    [string] $Action,
    [string] $ArchivePath,
    [Parameter(Mandatory = $true)]
    [string] $RunId
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ci-mysql-ownership.ps1')
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$artifacts = [IO.Path]::GetFullPath((Join-Path $root '.artifacts'))
$runDir = [IO.Path]::GetFullPath((Join-Path $artifacts "ci-mysql-$RunId"))
$marker = Join-Path $runDir '.ci-mysql-owned'
$data = Join-Path $runDir 'data'
$portFile = Join-Path $runDir 'port'
$pidFile = Join-Path $runDir 'process.json'
$version = '8.4.11'
$sha256 = 'A492371D687D2BAB088B0062581144A0044B8964BAEFDF4FAA579292B423D25C'
if ($RunId -cnotmatch '^[0-9a-f]{32}$') { throw 'Invalid disposable MySQL run identity.' }
if ($Action -eq 'stop' -and -not (Test-Path -LiteralPath $artifacts)) { return }

if ($Action -eq 'stop') {
    Assert-CiMysqlPath $artifacts $runDir $RunId
    if (-not (Test-Path -LiteralPath $runDir)) { return }
    Assert-CiMysqlOwner $artifacts $runDir $RunId $true
    $identity = $null
    if (Test-Path -LiteralPath $pidFile) {
        try { $identity = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json -ErrorAction Stop }
        catch { throw 'Disposable MySQL process identity malformed.' }
        if ($identity.runId -cne $RunId -or $identity.pid -notmatch '^[1-9][0-9]*$' -or
            $identity.startTicks -notmatch '^[1-9][0-9]*$' -or $identity.port -notmatch '^[1-9][0-9]*$' -or
            -not $identity.executable) { throw 'Disposable MySQL process identity malformed.' }
    }
    $candidates = @(Get-CimInstance Win32_Process -Filter "Name = 'mysqld.exe'" | Where-Object {
        [string]::Equals($_.ExecutablePath, (Join-Path $runDir "mysql-$version-winx64\bin\mysqld.exe"), [StringComparison]::OrdinalIgnoreCase) -and
        $_.CommandLine.Contains("--datadir=$data")
    })
    $server = $null
    if ($identity) {
        $server = $candidates | Where-Object ProcessId -eq ([int]$identity.pid) | Select-Object -First 1
        if (-not $server -and $candidates.Count) { throw 'Disposable MySQL process identity mismatch.' }
        if (-not $server -and (Get-CimInstance Win32_Process -Filter "ProcessId = $([int]$identity.pid)")) {
            throw 'Recorded MySQL PID belongs to unrelated process.'
        }
    } elseif ($candidates.Count -eq 1) {
        $server = $candidates[0]
    } elseif ($candidates.Count -gt 1 -and (Test-Path -LiteralPath $portFile)) {
        $port = [int](Get-Content -LiteralPath $portFile -Raw)
        $listener = Get-NetTCPConnection -State Listen -LocalAddress 127.0.0.1 -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
        $server = $candidates | Where-Object ProcessId -eq $listener.OwningProcess | Select-Object -First 1
        if (-not $server) { throw 'Multiple MySQL processes claim disposable directory.' }
    } elseif ($candidates.Count -gt 1) { throw 'Multiple MySQL processes claim disposable directory.' }
    if ($server) {
        $serverPid = [int]$server.ProcessId
        if ($identity) {
            $started = ([datetime]$server.CreationDate).ToUniversalTime().Ticks
            if ($identity.runId -cne $RunId -or $identity.startTicks -ne $started -or
                -not [string]::Equals($identity.executable, $server.ExecutablePath, [StringComparison]::OrdinalIgnoreCase) -or
                -not [string]::Equals($server.ExecutablePath, (Join-Path $runDir "mysql-$version-winx64\bin\mysqld.exe"), [StringComparison]::OrdinalIgnoreCase) -or
                -not $server.CommandLine.Contains("--datadir=$data")) { throw 'Refusing to stop unrelated MySQL process.' }
        }
        $mysqladmin = Join-Path $runDir "mysql-$version-winx64\bin\mysqladmin.exe"
        $port = [int](Get-Content -LiteralPath $portFile -Raw)
        if ($identity -and $identity.port -ne $port) { throw 'Disposable MySQL port identity mismatch.' }
        $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
        if ($listeners.Count -and @($listeners | Where-Object OwningProcess -ne $serverPid).Count) { throw 'Refusing to stop unrelated MySQL listener.' }
        if ($listeners.Count) {
            & $mysqladmin --no-defaults --protocol=TCP --host=127.0.0.1 "--port=$port" --user=root shutdown
            if ($LASTEXITCODE -ne 0) { throw 'MySQL shutdown failed.' }
        } else { Stop-Process -Id $serverPid -ErrorAction Stop }
        for ($i = 0; $i -lt 30 -and @(Get-CimInstance Win32_Process -Filter "Name = 'mysqld.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains("--datadir=$data") }).Count; $i++) {
            Start-Sleep -Seconds 1
        }
        if (@(Get-CimInstance Win32_Process -Filter "Name = 'mysqld.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains("--datadir=$data") }).Count) { throw 'MySQL process still running.' }
    }
    Assert-CiMysqlOwner $artifacts $runDir $RunId $true
    Remove-Item -LiteralPath $runDir -Recurse -Force
    Write-Output 'Disposable MySQL stopped and removed.'
    return
}

New-Item -ItemType Directory -Path $artifacts -Force | Out-Null
Assert-CiMysqlPath $artifacts $runDir $RunId
if (Test-Path -LiteralPath $runDir) { throw 'Disposable MySQL directory already exists.' }
New-Item -ItemType Directory -Path $runDir -ErrorAction Stop | Out-Null
Assert-CiMysqlPath $artifacts $runDir $RunId
$markerContent = @{ kind = 'SENKOM disposable MySQL v2'; runId = $RunId } | ConvertTo-Json -Compress
$markerStream = [IO.File]::Open($marker, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try {
    $bytes = [Text.Encoding]::UTF8.GetBytes($markerContent)
    $markerStream.Write($bytes, 0, $bytes.Length)
} finally { $markerStream.Dispose() }
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
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    & $mysqladmin --no-defaults --protocol=TCP --host=127.0.0.1 "--port=$port" --user=root ping 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    if ($server.HasExited) { throw 'MySQL exited before readiness.' }
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'MySQL readiness timeout.' }
$listeners = @(Get-NetTCPConnection -State Listen -LocalAddress 127.0.0.1 -LocalPort $port -ErrorAction SilentlyContinue)
if ($listeners.Count -ne 1) { throw 'Disposable MySQL listener identity missing.' }
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listeners[0].OwningProcess)"
if (-not $process -or -not [string]::Equals($process.ExecutablePath, $mysqld, [StringComparison]::OrdinalIgnoreCase) -or
    -not $process.CommandLine.Contains("--datadir=$data")) { throw 'Disposable MySQL listener belongs to unrelated process.' }
@{ runId = $RunId; pid = $process.ProcessId; startTicks = ([datetime]$process.CreationDate).ToUniversalTime().Ticks; executable = $process.ExecutablePath; port = $port } |
    ConvertTo-Json -Compress | Set-Content -LiteralPath $pidFile -NoNewline
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
