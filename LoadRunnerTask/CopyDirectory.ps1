
param (
    [string]$path,
    [string]$destinationPath,
    [string]$logsPath
 )


$destinationExists = Test-Path "$destinationPath"
if( -Not $destinationExists ){
    New-Item "$destinationPath" -ItemType "directory"  | Add-Content -Path "$logsPath"
}
Copy-Item -Path "$path" -Destination "$destinationPath" -Recurse -Force | Add-Content -Path "$logsPath"
