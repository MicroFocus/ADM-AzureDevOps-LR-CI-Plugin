### LoadRunner tests automation
This tutorial will guide you through creating your own environment in order to use the LoadRunner plugin, which includes the following tasks:
•	Prerequisites installation
•	Environment configuration
•	How to use the plugin
	o	Parameters and their usage
	o	Use cases

## Prerequisites
1.	Windows 7, Windows 8.1, Windows 10 (if using client OS) or Windows 2012 R2 SP1 or higher ((if using a server os)
2.	Powershell 5.0 or higher (see https://docs.microsoft.com/en-us/skypeforbusiness/set-up-your-computer-for-windows-powershell/download-and-install-windows-powershell-5-1)
3.	The machine that you are using is configured as an Azure Devops self-hosted agent (see https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-windows?view=azure-devops)
4.	Internet Information Services (IIS) have to be installed and enabled on your agent

## Environment configuration

1.	You have to ensure that the user that is being used by the Azure Pipelines Agent service has enough permissions (read/write)
2.	You have to create your own test scenarios and to ensure that their location is accessible for you agent
3.	LoadRunner has to be installed on your agent machine

## How to use the plugin
#  Parameters and their usage
o	Source path: Path for the test or path for the folder that contains the tests. (required parameter)
o	Results directory: The directory where the test results are saved. The default value is C:\LoadRunnerResults.
o	Task timeout: Timeout value for the task execution, in minutes. If this is empty, there will be no timeout for the task. Negative values will not produce any effects. The default value is -1.
o	LoadRunner Settings:
		Controller polling interval: Polling interval for checking the scenario status, in seconds. The default is 30 seconds.
		Scenario execution timeout: The maximum time allotted for scenario execution, in minutes.
		Analysis template: Apply a template for the build (path to a .tem file). Leave blank to use the default template. 
		Treat failures as errors: When marked as true, if a test scenario fails, the task will be marked as failed.
o	Results Handling Settings:
		Publish scenario results: If this is selected, the results will be available as a web application hosted by the agent used for the job. (IIS must be available on the agent.)
		Publish artifacts manually: If this is not selected, the results will be uploaded automatically as build artifacts. If it is selected, you can choose to upload (or not) the results manually later. (See Publish Build Artifacts task)
		Build artifacts directory: Directory used for build artifacts. The scenario results are stored here. The default value is $(Build.ArtifactStagingDirectory)\LoadRunnerArtifacts
		Publish test reports manually: If this is not selected, the tests reports will be published automatically. If it is selected, you can choose to publish (or not) them manually later. (See Publish Test Results task)
		Build test reports directory: Directory used for reports. The scenario reports are stored here. The default value is $(Build.ArtifactStagingDirectory)\LoadRunnerReports
