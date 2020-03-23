
param (
    [string]$webApplicationName,
    [string]$resultsDirectory,
    [string]$buildLabel,
    [string]$scenario,
    [string]$logsPath
 )


function webApplicationExists {
    param ( [string] $webApplicationName )

    if(Get-WebApplication -Name "$webApplicationName"){
        return $true
    }
    return $false

}

function addWebApplication {
    param ( [string] $webApplicationName, [string] $resultsDirectory)
    
    New-WebApplication -Name "$webApplicationName" -Site 'Default Web Site' -PhysicalPath "$resultsDirectory" -ApplicationPool "DefaultAppPool"
}

function enableApplicationBrowsing {
    param ( [string] $webApplicationName )
    $appcmd = "$env:systemroot\system32\inetsrv\appcmd.exe"
    $enableCmd = "$appcmd set config 'Default Web Site/$webApplicationName' /section:system.webServer/directoryBrowse /enabled:true"
    invoke-expression $enableCmd
}

function addDefaultComponentToPage {
    param ([string] $page )
    
    $defaultDocumentPath = "$resultsDirectory\$buildLabel\$scenario\HTML.html"
    if(Test-Path -Path $defaultDocumentPath){
        $appcmd = "$env:systemroot\system32\inetsrv\appcmd.exe"
        $addComponentCmd = "$appcmd set config `"$page`" /section:defaultDocument /+files.[value='HTML.html']"
        cmd /c "$addComponentCmd"
    }else{
        write-host "$defaultDocumentPath was not found"
    }
}

function hideFile {
    param ([string] $path )

    if(Test-Path $path){
    
        $file = Get-Item "$path" -Force;
        if($file){
            if(-not $file.Attributes.HasFlag([System.IO.FileAttributes]::Hidden)){
                $file.Attributes += 'Hidden';
            }
        }
    }else{
        Add-Content -Path "$logsPath" -Value "$path not found!"
    }
}
## ============================================================================================
## ============================================================================================
## ============================================================================================
## ============================================================================================

$resultsDirectory = $resultsDirectory.replace("\\","\");
$foundApplication = webApplicationExists -webApplicationName "$webApplicationName";
$buildResultsPath = "$resultsDirectory\$buildLabel"
$foundDirectory = Test-Path -Path $buildResultsPath;
if( -Not $foundApplication -And $foundDirectory){
    addWebApplication -webApplicationName "$webApplicationName" -resultsDirectory "$buildResultsPath" | Add-Content -Path "$logsPath";
}

enableApplicationBrowsing -webApplicationName "$webApplicationName" | Add-Content -Path "$logsPath";

$webConfigPath = "$buildResultsPath\web.config";
hideFile -path $webConfigPath


$scenarioPage = "Default Web Site/$webApplicationName/$scenario";
addDefaultComponentToPage -page $scenarioPage | Add-Content -Path "$logsPath";

$scenarioWebConfigPath = "$buildResultsPath\$scenario\web.config";
hideFile -path $scenarioWebConfigPath
