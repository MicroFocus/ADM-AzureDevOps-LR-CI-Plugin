# LoadRunner Professional Tests Automation

You can set up Azure DevOps pipelines to work with LoadRunner Professional tests, to integrate load tests into your CI/CD testing process. LoadRunner Professional provides a plugin for the Azure DevOps, enabling the execution of Controller scenarios as part of a build, and to view the results in Azure DevOps reports.

The following sections describe how to set up the environment to use the LoadRunner Azure plugin.

## Environment configuration

The machine to be used for the job should be configured as an Azure DevOps self-hosted agent (see [Self-hosted Windows agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-windows?view=azure-devops))

LoadRunner Professional installed on the Azure DevOps agent machine

Create your test scenarios and ensure that their location is accessible by the Azure DevOps agent.

## Documentation

For more details about the extension, please, check [LoadRunner Professional Help Center](https://admhelp.microfocus.com/lr/en/latest/help/WebHelp/Content/Controller/Azure_DevOps.htm).
