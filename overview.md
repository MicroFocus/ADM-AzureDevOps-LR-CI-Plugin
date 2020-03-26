# LoadRunner Professional Tests Automation

## Environment configuration
1.	The machine that you are using is configured as an Azure Devops self-hosted agent ([Self-hosted Windows agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-windows?view=azure-devops))
2.	You have to ensure that the user that is being used by the Azure Pipelines Agent service has privileged permissions
3.	LoadRunner has to be installed on your agent machine
4.	You have to create your own test scenarios and to ensure that their location is accessible for your agent 
5.	Internet Information Services (IIS) have to be installed and enabled on your agent
6.  Powershell 5.0 or higher ([Download and install Windows PowerShell 5.1](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-windows?view=azure-devops)https://docs.microsoft.com/en-us/skypeforbusiness/set-up-your-computer-for-windows-powershell/download-and-install-windows-powershell-5-1)

## Integration with LoadRunner Professional
This extension enables you to include a LoadRunner Professional test execution as a task in a Azure DevOps / Microsoft Team Foundation Server CI build process.

## Documentation
For more details about the extension, feel free to see [LoadRunner Professional Tests Automation Documentation](https://github.com/MicroFocus/ADM-AzureDevOps-LR-CI-Plugin).