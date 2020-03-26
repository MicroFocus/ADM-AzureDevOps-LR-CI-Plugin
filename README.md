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

## How to use the plugin
###  Parameters and their usage
1.	Source path: Path for the test or path for the folder that contains the tests. (required parameter)
2.	Results directory: The directory where the test results are saved. The default value is C:\LoadRunnerResults.
3.	Task timeout: Timeout value for the task execution, in minutes. If this is empty, there will be no timeout for the task. Negative values will not produce any effects. The default value is -1.
4.	LoadRunner Settings:
	-	Controller polling interval: Polling interval for checking the scenario status, in seconds. The default is 30 seconds.
	-	Scenario execution timeout: The maximum time allotted for scenario execution, in minutes.
	-	Analysis template: Apply a template for the build (path to a .tem file). Leave blank to use the default template. 
	-	Treat failures as errors: When marked as true, if a test scenario fails, the task will be marked as failed.
5.	Results Handling Settings:
	-	Publish scenario results: If this is selected, the results will be available as a web application hosted by the agent used for the job. (IIS must be available on the agent.)
	-	Publish artifacts manually: If this is not selected, the results will be uploaded automatically as build artifacts. If it is selected, you can choose to upload (or not) the results manually later. (See Publish Build Artifacts task)
	-	Build artifacts directory: Directory used for build artifacts. The scenario results are stored here. The default value is $(Build.ArtifactStagingDirectory)\LoadRunnerArtifacts
	-	Publish test reports manually: If this is not selected, the tests reports will be published automatically. If it is selected, you can choose to publish (or not) them manually later. (See Publish Test Results task)
	-	Build test reports directory: Directory used for reports. The scenario reports are stored here. The default value is $(Build.ArtifactStagingDirectory)\LoadRunnerReports
