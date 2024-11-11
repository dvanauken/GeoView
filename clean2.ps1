# clean-path.ps1
# Must be run as administrator
$ErrorActionPreference = 'Stop'

try {
    # Get current paths
    $systemPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')

    Write-Host "Cleaning up Node.js related paths..."

    # Clean system path
    $newSystemPath = ($systemPath -split ';' | Where-Object { 
        $_ -ne 'C:\Program Files\nodejs' -and
        -not $_.Contains('nvm\v22.3.0') -and
        -not ($_ -eq 'C:\Users\Aaron.DTCE7894F66E23C\AppData\Roaming\nvm' -and 
            ($systemPath -split ';' | Where-Object { $_ -eq 'C:\Users\Aaron.DTCE7894F66E23C\AppData\Roaming\nvm' }).Count -gt 1)
    } | Select-Object -Unique) -join ';'

    # Clean user path
    $newUserPath = ($userPath -split ';' | Where-Object { 
        $_ -ne 'C:\Program Files\nodejs' -and
        -not $_.Contains('nvm\v22.3.0') -and
        -not ($_ -eq 'C:\Users\Aaron.DTCE7894F66E23C\AppData\Roaming\nvm' -and 
            ($userPath -split ';' | Where-Object { $_ -eq 'C:\Users\Aaron.DTCE7894F66E23C\AppData\Roaming\nvm' }).Count -gt 1)
    } | Select-Object -Unique) -join ';'

    # Set new paths
    [Environment]::SetEnvironmentVariable('Path', $newSystemPath, 'Machine')
    [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')

    Write-Host "Path cleanup completed successfully!"
} catch {
    Write-Host "An error occurred: $_"
    exit 1
}