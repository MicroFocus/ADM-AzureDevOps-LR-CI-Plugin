
param (
    [string]$scenarioPath,
    [string]$logsPath
 )


function formatScenarioReport {
    param ( [string] $scenarioPath )

    if(Test-Path -Path $scenarioPath){
        $tmp = "$scenarioPath-tmp"

        $scenarioIE = "$scenarioPath\HTML\IE\"

        if(Test-Path -Path $scenarioIE){
            Copy-Item -Path $scenarioIE -Destination $tmp -Recurse

            Remove-Item -Path $scenarioPath -Force -Recurse

            Copy-Item -Path $tmp -Destination $scenarioPath -Force -Recurse

            Remove-Item -Path $tmp -Force -Recurse
        }else{
            write-host "Scenario results were not found!"
        }
    }else{
        write-host "Scenario directory was not found!"
    }
}

formatScenarioReport -scenarioPath $scenarioPath | Add-Content -Path "$logsPath";
    