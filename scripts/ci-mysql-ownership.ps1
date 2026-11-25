function Assert-CiMysqlPath([string] $Artifacts, [string] $RunDir, [string] $RunId, [bool] $InspectContents = $false) {
    if ($RunId -cnotmatch '^[0-9a-f]{32}$') { throw 'Invalid disposable MySQL run identity.' }
    $expected = [IO.Path]::GetFullPath((Join-Path $Artifacts "ci-mysql-$RunId"))
    if (-not [string]::Equals([IO.Path]::GetFullPath($RunDir), $expected, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected disposable MySQL path.' }
    for ($part = Get-Item -LiteralPath $Artifacts -Force; $part; $part = $part.Parent) {
        if ($part.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse point in disposable MySQL parent path.' }
    }
    if (-not (Test-Path -LiteralPath $RunDir)) { return }
    $pending = [Collections.Generic.Stack[string]]::new()
    $pending.Push($RunDir)
    while ($pending.Count) {
        $path = $pending.Pop()
        $item = Get-Item -LiteralPath $path -Force
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse point in disposable MySQL directory.' }
        if ($InspectContents -and $item.PSIsContainer) {
            foreach ($child in [IO.Directory]::EnumerateFileSystemEntries($path)) { $pending.Push($child) }
        }
    }
}

function Assert-CiMysqlOwner([string] $Artifacts, [string] $RunDir, [string] $RunId, [bool] $InspectContents = $false) {
    Assert-CiMysqlPath $Artifacts $RunDir $RunId $InspectContents
    $marker = Join-Path $RunDir '.ci-mysql-owned'
    if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw 'Disposable MySQL ownership marker missing.' }
    try { $owner = Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json -ErrorAction Stop }
    catch { throw 'Disposable MySQL ownership marker malformed.' }
    if ($owner.runId -cne $RunId -or $owner.kind -cne 'SENKOM disposable MySQL v2') { throw 'Disposable MySQL ownership mismatch.' }
}
