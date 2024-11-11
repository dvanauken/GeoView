# First, get current System and User paths
$systemPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')

# Define paths to remove
$pathsToRemove = @(
    'C:\Program Files\nodejs',
    'C:\Users\Aaron.DTCE7894F66E23C\AppData\Roaming\nvm\v22.3.0'
)

# Clean up System path
$newSystemPath = ($systemPath -split ';' | Where-Object { 
    $path = $_
    -not ($pathsToRemove | Where-Object { $path -like "$_*" })
} | Select-Object -Unique) -join ';'

# Clean up User path
$newUserPath = ($userPath -split ';' | Where-Object { 
    $path = $_
    -not ($pathsToRemove | Where-Object { $path -like "$_*" })
} | Select-Object -Unique) -join ';'

# Set the new paths
[Environment]::SetEnvironmentVariable('Path', $newSystemPath, 'Machine')
[Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')