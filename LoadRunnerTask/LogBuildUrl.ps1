
param (
    [string]$buildEndpoint
 )

$ipAddress = (Invoke-WebRequest -uri "http://ifconfig.me/ip").Content;
$computer = Get-WmiObject win32_computersystem;
$hostname = $computer.Name;
$domain = $computer.Domain;

Write-Host "Build URL: http://$hostname.$domain/$buildEndpoint or http://$ipAddress/$buildEndpoint";
