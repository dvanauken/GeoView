# Get the current timestamp in the format: YYYYMMDDHHmmss
$timestamp = (Get-Date).ToString("yyyyMMddHHmmss")

# Define the output file name using the timestamp
$outputFile = "tree.$timestamp.txt"

# Execute the Tree command and filter out 'node_modules' and '.angular' directories, including their subdirectories
tree /A /F | Select-String -Pattern 'node_modules|\.angular' -NotMatch | Out-File -FilePath $outputFile

# Display a message to confirm completion
Write-Host "Directory structure saved to $outputFile, excluding 'node_modules' and '.angular' subdirectories."