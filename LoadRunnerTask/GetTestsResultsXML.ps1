
param (
    [string]$scenarioPath,
    [string]$testReportName,
    [string]$destinationPath,
    [string]$logsPath
 )

    
$scenarioReportPath = "$scenarioPath\$testReportName"
write-host $scenarioReportPath
if(Test-Path "$scenarioReportPath"){
    $destinationExists = Test-Path "$destinationPath"
    if( -Not $destinationExists ){
        New-Item "$destinationPath" -ItemType "directory"  | Add-Content -Path "$logsPath"
    }
    Copy-Item -Path "$scenarioReportPath" -Destination "$destinationPath\$testReportName" -Force  | Add-Content -Path "$logsPath"
}
else{
    write-host "Scenario: $scenarioPath doesn't contain any report available!"
}
 

