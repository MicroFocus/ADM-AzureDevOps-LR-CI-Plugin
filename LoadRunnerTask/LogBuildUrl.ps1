
param (
    [string]$buildLabel, [string]$buildResultsPath
 )

function webApplicationMatch{
    param ( [string] $webAppName )

    $webApp = Get-WebApplication -Name "$webAppName";
    if($webApp){
        $webAppPath = $webApp.physicalPath;
        if("$webAppPath" -eq "$buildResultsPath"){
            return $True;
        }
    }
    return $False
}

$webAppName = "";

if(webApplicationMatch -webAppName "$buildLabel"){
    $webAppName = $buildLabel;
}else{
    $index = 1;

    while($True){
        $name = "$buildLabel-$index";
        $app = Get-WebApplication -Name "$name";
        if($app){
            if(webApplicationMatch -webAppName "$name"){
                $webAppName = $name;
                break;
            }else{
                $index = $index + 1;
            }
        }else{
            break;
        }
    }
}

if($webAppName -ne ""){

    $ipAddress = (Invoke-WebRequest -uri "http://ifconfig.me/ip").Content;
    $computer = Get-WmiObject win32_computersystem;
    $hostname = $computer.Name;
    $domain = $computer.Domain;

    $hostnameEndpoint = "http://$hostname.$domain/$webAppName";
    $publicIpEndpoint = "http://$ipAddress/$webAppName";

    Write-Host "Build URL: $hostnameEndpoint or $publicIpEndpoint";
}else{
    Write-Host "Build URL: Not Found";
}
