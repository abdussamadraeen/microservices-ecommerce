
# ⚠️ WARNING: THIS SCRIPT PERMANENTLY DELETES FOLDERS ⚠️
# It is designed to clean up 'node_modules', '.next', 'dist', 'build', and '.turbo' directories
# to reduce the project size for CD/DVD submission.
# Make sure you have a backup if you are unsure!

$confirmation = Read-Host "Are you sure you want to clean up the project? This will delete all 'node_modules' and build folders. (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Cleanup cancelled."
    exit
}

Write-Host "Starting cleanup process..." -ForegroundColor Cyan

# Function to remove a directory recursively
function Remove-Directory {
    param (
        [string]$Path
    )
    if (Test-Path $Path) {
        Write-Host "Removing: $Path" -ForegroundColor Yellow
        Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Directories to remove
$targetProjectRoot = Get-Location
$foldersToDelete = @("node_modules", ".next", ".turbo", "dist", "build", "coverage")

# Find and remove directories
foreach ($folder in $foldersToDelete) {
    Get-ChildItem -Path $targetProjectRoot -Recurse -Directory -Filter $folder | ForEach-Object {
        Remove-Directory -Path $_.FullName
    }
}

# Remove log files
Get-ChildItem -Path $targetProjectRoot -Recurse -File -Filter "*.log" | ForEach-Object {
    Write-Host "Removing log file: $($_.FullName)" -ForegroundColor DarkYellow
    Remove-Item -Path $_.FullName -Force
}

Write-Host "Cleanup complete! The project is now ready for submission." -ForegroundColor Green
Write-Host "Total size should be significantly reduced."
Write-Host "To restore the project, run: pnpm install"
