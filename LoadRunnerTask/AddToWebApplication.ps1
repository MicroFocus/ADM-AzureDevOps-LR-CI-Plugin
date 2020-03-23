
param (
    [string]$webApplicationName,
    [string]$resultsDirectory,
    [string]$buildLabel,
    [string]$scenario
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


## ============================================================================================
## ============================================================================================
## ============================================================================================
## ============================================================================================


$foundApplication = webApplicationExists -webApplicationName "$webApplicationName"
$foundDirectory = Test-Path -Path $resultsDirectory
if( -Not $foundApplication -And $foundDirectory){
    addWebApplication -webApplicationName "$webApplicationName" -resultsDirectory "$resultsDirectory"
}

enableApplicationBrowsing -webApplicationName "$webApplicationName"

$scenarioPage = "Default Web Site/$webApplicationName/$buildLabel/$scenario"
addDefaultComponentToPage -page $scenarioPage 
