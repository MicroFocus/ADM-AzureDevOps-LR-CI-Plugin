import taskLibrary = require('azure-pipelines-task-lib/task');
import fs = require('fs')
import os = require('os');
import * as path from "path";
var process = require('process');

var errorLevel: number = 0;

class Tag{
	uiName: string;
	propName: string;
	defaultValue: any;

	constructor(uiName: string, propName: string, defaultValue: any){
		this.uiName = uiName;
		this.propName = propName;
		this.defaultValue = defaultValue;
	}
}

const notAvailable = "NA";
const propsFilename = path.join(__dirname, "props.txt");
const hpToolsLauncherName: string = "HPToolsLauncher.exe";
const hpToolsLauncherPath = path.join(__dirname, hpToolsLauncherName);
const lrAnalysisLauncherName: string = "LRAnalysisLauncher.exe";
const lrAnalysisLauncherPath: string = path.join(__dirname, lrAnalysisLauncherName);

const sourcePathTestsTag = new Tag("SourcePath", "Test1", notAvailable)
const testsResultsPathTag = new Tag("ResultsDirectory", "fsReportPath", "C:\\\\LoadRunnerResults");
const controllerPollingIntervalTag = new Tag("ControllerPollingInterval", "controllerPollingInterval", 30);
const scenarioTimeoutTag = new Tag("ScenarioExecutionTimeout", "PerScenarioTimeOut", 10);
const analysisTemplateTag = new Tag("AnalysisTemplate", "analysisTemplate", "");
const displayControllerTag =  new Tag("DisplayController", "displayController", "false");
const runTypeTag = new Tag("RunType", "runType", "FileSystem");
const taskTimoutTag = new Tag("TaskTimeout", "fsTimeout", -1);
const testResultsReportTag = new Tag("TestResultsReport", "resultsFilename", "Report.xml")
const treatFailureAsErrorTag = new Tag("TreatFailuresAsErrors", "treatFailuresAsErrors", "true");
const buildId: string = taskLibrary.getVariable('Build.BuildId').replace(/ /g, "");
const buildNumber: string = taskLibrary.getVariable('Build.BuildNumber').replace(/ /g, "");
const buildLabelTag = new Tag("BuildLabel", "buildLabel", `Build${buildId}-${buildNumber}`);
const publishScenarioResultsTag = new Tag("PublishScenarioResults", "publishScenarioResults", "true");
const publishArtifactsManuallyTag = new Tag("PublishArtifactsManually", "publishArtifactsManually", "false");
const buildArtifactDirectory: string = taskLibrary.getVariable('Build.ArtifactStagingDirectory')
const buildArtifactsDirectoryTag = new Tag("BuildArtifactsDirectory", "buildArtifactsDirectory", `${buildArtifactDirectory}\\LoadRunnerArtifacts`);
const publishTestReportsManuallyTag = new Tag("PublishTestReportsManually", "publishTestReportsManually", "false");
const buildTestReportsDirectoryTag = new Tag("BuildTestReportsDirectory", "buildTestReportsDirectory", `${buildArtifactDirectory}\\LoadRunnerReports`);
const artifactsLabel: string = 'MFTestsArtifacts'

let loadRunnerTagList: Array<Tag> = [
	sourcePathTestsTag, testsResultsPathTag, controllerPollingIntervalTag, 
	scenarioTimeoutTag, analysisTemplateTag, displayControllerTag,
	runTypeTag, taskTimoutTag, testResultsReportTag
]

let taskTagList: Array<Tag> = [
	treatFailureAsErrorTag, buildLabelTag, publishScenarioResultsTag,
	publishArtifactsManuallyTag, buildArtifactsDirectoryTag,
	publishTestReportsManuallyTag, buildTestReportsDirectoryTag
]

async function getLastDirectoryFromPath(path: string){
	let lastDirectoryName: string = null
	const pathComponents: string[] = path.split('\\');
	if(pathComponents.length > 0){
		lastDirectoryName = pathComponents[pathComponents.length - 1];
	}
	return lastDirectoryName
}

async function createDirectory(directoryPath: string, logsPath: string){
	const psCommand: string = `New-Item -Path "${directoryPath}" -ItemType "directory" -Force | Add-Content -Path "${logsPath}"`
	await execPsCommand(psCommand)
}

async function execPsCommand(command: string):Promise<string>{
	return new Promise<string>(resolve => {
			
			var spawn = require("child_process").spawn,child;
			var consoleOutput: string = "";
			child = spawn("powershell.exe",[command]);
			child.stdout.on("data",function(data: string){
				console.log(data);
				consoleOutput += data;
			});
			child.stderr.on("data",function(data: string){
				console.log("Errors: " + data);
				consoleOutput += "Errors: " + data;
				errorLevel += 1;
			});
			child.on("exit",function(){
				resolve(consoleOutput);
			});
			child.stdin.end();
		});
}

async function getDate(): Promise<string>{
	var date: string = new Date().toLocaleString();
	date = date.replace(/\//g, ".");
	date = date.replace(/ /g, "");
	date = date.replace(/:/g, "-");
	date = date.replace(/,/g, ".");
	return new Promise<string> (resolve => {
		resolve(date);
	});
}

async function getInput(tag: Tag){
	var tagValue: string;
	try{
		const tagInput: string | undefined = taskLibrary.getInput(tag.uiName, true);
		if (tagInput == 'bad') {
			taskLibrary.setResult(taskLibrary.TaskResult.Failed, `Bad input was given for ${tag.uiName}`);
			return;
		}else{
			tagValue = tagInput.replace(/\\/g, "\\\\");
		}
	}catch(exception){
		if(tag.defaultValue != notAvailable){
			tagValue = tag.defaultValue;
		}
		else taskLibrary.setResult(taskLibrary.TaskResult.Failed, `Bad input was given for ${tag.uiName}`);
	}
	return tagValue;
}

async function getParameters(tagList: Array<Tag>, logsPath: string){
	const params: {[id: string] : string;} = {};

	for (let tag of tagList) {
		const input = await getInput(tag)
		params[tag.propName] = input;
		appendFile(logsPath, `Param => ${tag.uiName} = ${input}`);
	}
	return params;
}

async function getAllScenarios(sourcePath: string): Promise<string[]> {
	return new Promise<string[]> (resolve => {
		const allScenarios: string[] = [];
		fs.readdirSync(sourcePath).forEach(file => {
			if(file.match(/.lrs/) != null){
				allScenarios.push(file);
			}
		});
		resolve(allScenarios);
	});
}

async function clone(dict: { [id: string] : string; }): Promise<{[id: string]: string;}>{
	return new Promise<{[id: string]: string;}> (resolve =>{
		const newDict: {[id: string]: string;} = {};
		for(let key in dict){
			newDict[key] = dict[key];
		}
		resolve(newDict);
	});
}

async function writeFile(filePath: string, fileContent: string){
	fs.writeFileSync(filePath, fileContent);
}

async function appendFile(filePath: string, fileContent: string){
	fs.appendFile(filePath, `${fileContent}\n`, function (err) {
		if (err) throw err;
	  });
}

async function createPropsFile(props: { [id: string] : string; }, logsPath: string): Promise<void>{
	if(props[displayControllerTag.propName].toLowerCase() == 'true'){
		props[displayControllerTag.propName] = '1'
	}else{
		props[displayControllerTag.propName] = '0'
	}
	var fileContent: string = '';
	for (let property in props) {
		fileContent += `${property}=${props[property]}\n`
	}
	await appendFile(logsPath, fileContent);
	await writeFile(propsFilename, fileContent);
}

async function copyFile(sourcePath: string, destinationPath: string, logsPath: string): Promise<void>{

	const scriptPath:string = path.join(__dirname, "CopyDirectory.ps1");

	const psCommand:string = `& "${scriptPath}" -path "${sourcePath}" -destinationPath "${destinationPath}" -logsPath "${logsPath}" `;
	await execPsCommand(psCommand);
	await appendFile(logsPath, psCommand)
	if(errorLevel != 0){
		errorLevel = 0;
		throw new Error(`There was an error copying ${sourcePath} to ${destinationPath}`)
	}
}

async function cleanExistentProcesses(): Promise<void>{
	const processesListForCmd = "'HpToolsLauncher|Wlrun|LRAnalysisLauncher'"
	const killProcessesCmd: string = `if(get-process -name "${processesListForCmd}" -ErrorAction SilentlyContinue){` +
										"get-process | Where-Object " + 
										`{$_.ProcessName -match "${processesListForCmd}"}` +
										" | stop-process -force" +
									 "}"
	await execPsCommand(killProcessesCmd);
	if(errorLevel != 0){
		errorLevel = 0;
		throw new Error("There is a running HpToolsLauncher, Wlrun or LRAnalysisLauncher process that couldn't be killed!")
	}
}

async function prepareEnvironment(logsPath: string):Promise<void>{
	await cleanExistentProcesses();
	var workspace: string = await execPsCommand("$pwd.Path");
	workspace = workspace.trim();
	await copyFile(hpToolsLauncherPath, workspace, logsPath);
	await copyFile(lrAnalysisLauncherPath, workspace, logsPath);
}

async function executeHpToolsLauncher(): Promise<string>{
	var workspace: string = await execPsCommand("$pwd.Path");
	workspace = workspace.trim();
	const hpToolsLauncherExecCommand: string = `& "${hpToolsLauncherPath}" -paramfile "${propsFilename}"`;
	const hpToolsLauncherCommandOutput: string = await execPsCommand(hpToolsLauncherExecCommand);
	return hpToolsLauncherCommandOutput;
}

async function archiveResults(resultPath: string, logsPath: string): Promise<void>{

	const archiveCmd = `Compress-Archive -Path "${resultPath}\\*" -DestinationPath "${resultPath}.zip" ` +
		`-Force | Add-Content -Path "${logsPath}"`;

	await execPsCommand(archiveCmd);
	if(errorLevel != 0){
		errorLevel = 0;
		throw new Error("There was an error during the archive process!")
	}
}

async function formatPath(path: string, subPath: string): Promise<string>{
	return path + "\\\\" + subPath;
}

async function defineSourceScenarios(propsDict: { [id: string] : string; }): Promise<string[]> {
	var allScenarios: string[] = [];
	const sourcePathTests: string = propsDict[sourcePathTestsTag.propName];
	if(sourcePathTests.match(/.lrs/) != null){
		const scenarioName: string = await getLastDirectoryFromPath(sourcePathTests);
		if(scenarioName != null){
			allScenarios.push(scenarioName);
			propsDict[sourcePathTestsTag.propName] = sourcePathTests.replace("\\\\" + scenarioName, "")
		}
	}else{
		allScenarios = await getAllScenarios(sourcePathTests);
	}
	return new Promise<string[]> (resolve => {
		resolve(allScenarios);
	});
}

async function tryExecHpToolsLauncher(threatFailureAsError: boolean): Promise<void>{
	const execScenario: string = "Run scenario";
	const succesStatus: string = "Job succeeded";
	const unstableStatus: string = "Job unstable (Passed with failed tests)";
	const hpToolsLauncherOutput = await executeHpToolsLauncher();

	if(!hpToolsLauncherOutput.includes(succesStatus)){
		if(!(hpToolsLauncherOutput.includes(unstableStatus) && !threatFailureAsError)){
			errorLevel += 1;
		}
	}
	if(errorLevel != 0){
		errorLevel = 0;
		throw new Error(execScenario + " - Failure");
	}
}

async function getScenarioResultsPath(testsResultsPath: string, buildLabel: string, scenarioName: string, extensionToScenarioName: string){
	let scenarioResultPath: string = await formatPath(testsResultsPath, buildLabel);
	const scenarioResultDirectory: string = scenarioName.replace(".lrs", extensionToScenarioName);
	scenarioResultPath = await formatPath(scenarioResultPath, scenarioResultDirectory);
	return scenarioResultPath
}

async function getScenarioReportName(scenarioName: string, reportName: string){
	return `${scenarioName}-${reportName}`
}

async function pathExists(path: string){
	fs.stat(path, (exists) => {
		if (exists == null) {
			return true;
		} else if (exists.code === 'ENOENT') {
			return false;
		}
	});
}

async function getScenarioReportPath(scenarioResultPath:string, reportName: string, reportsPath: string){
	const scenarioResultsName: string = await getLastDirectoryFromPath(scenarioResultPath)
	const scenarioReportName:string = await getScenarioReportName(scenarioResultsName, reportName)
	return await formatPath(reportsPath, scenarioReportName);
}

async function tryExecuteScenario(scenarioName: string, scenarioResultPath: string,
	parameters: { [id: string] : string}, threatFailureAsError: boolean, 
	artifactsPath: string, logsPath: string){
	
		var errorsLogs: string = "";
		const properties: { [id: string] : string; } = await clone(parameters);

		properties[sourcePathTestsTag.propName] = await formatPath(parameters[sourcePathTestsTag.propName], scenarioName);
		properties[testsResultsPathTag.propName] = scenarioResultPath;

		const scenarioResultsName: string = await getLastDirectoryFromPath(scenarioResultPath)
		const scenarioReportName:string = await getScenarioReportName(scenarioResultsName, parameters[testResultsReportTag.propName])
		properties[testResultsReportTag.propName] = await formatPath(scenarioResultPath, scenarioReportName);
		
		await createPropsFile(properties, logsPath);
		
		try{
			await tryExecHpToolsLauncher(threatFailureAsError);
		}catch(err){
			errorsLogs += `Error: ${err.message}\n`;
		}
		
		try{
			await copyFile(properties[testsResultsPathTag.propName], artifactsPath, logsPath);
		}catch(err){
			errorsLogs += `Error: ${err.message}\n`;
		}

		try{
			await archiveResults(properties[testsResultsPathTag.propName], logsPath);
		}catch(err){
			errorsLogs += `Error: ${err.message}\n`;
		}
		
		if(errorsLogs != ""){
			throw new Error(errorsLogs);
		}
}

async function getTestResultsXML(scenarioResultPath: string, reportFilename:string, 
	destinationPath: string, logsPath: string){

	appendFile(logsPath, "In get tests results");

	const scriptPath = path.join(__dirname, "GetTestsResultsXML.ps1");

	const psCommand = `& "${scriptPath}" -scenarioPath "${scenarioResultPath}" ` +
		`-testReportName "${reportFilename}" -destinationPath "${destinationPath}" `+
		`-logsPath "${logsPath}"`
	appendFile(logsPath, psCommand);

	await execPsCommand(psCommand);
}

async function prepareWebApplicationResults( scenarioResultPath: string, logsPath: string){

	appendFile(logsPath, "In prepareWebApplicationResults");
	const scriptPath = path.join(__dirname, "PrepareWebApplicationResults.ps1");
	
	const psCommand = `& "${scriptPath}" -scenarioPath "${scenarioResultPath}" -logsPath "${logsPath}"`;
	appendFile(logsPath, psCommand);
	await execPsCommand(psCommand);
}

async function addWebApplication(resultsDirectory: string, buildLabel: string,
	scenarioName: string, logsPath: string){

		appendFile(logsPath, "In addWebApplication");
		const scriptPath = path.join(__dirname, "AddWebApplication.ps1");

		// const webApplication: string = await getLastDirectoryFromPath(resultsDirectory);

		// if(webApplication != null){
		const psCommand = `& "${scriptPath}" -webApplicationName "${buildLabel}" -resultsDirectory "${resultsDirectory}" ` +
			`-buildLabel "${buildLabel}" -scenario "${scenarioName}" -logsPath "${logsPath}"`;
		appendFile(logsPath, psCommand);
		await execPsCommand(psCommand);
		// }
}

async function handleResults(loadRunnerParameters: {[id: string] : string;}, 
	taskParameters: {[id: string] : string;}, scenarioResultPath: string, logsPath: string){
		
		const resultsDirectory: string = loadRunnerParameters[testsResultsPathTag.propName]
		const buildLabel: string = taskParameters[buildLabelTag.propName];
		const destinationPath: string = taskParameters[buildTestReportsDirectoryTag.propName]
		const scenarioName: string = await getLastDirectoryFromPath(scenarioResultPath)
		const scenarioReportName:string = await getScenarioReportName(scenarioName, loadRunnerParameters[testResultsReportTag.propName])
		appendFile(logsPath, "In handle results");
		
		await getTestResultsXML(scenarioResultPath, scenarioReportName, destinationPath, logsPath);

		await prepareWebApplicationResults(scenarioResultPath, logsPath)
		
		if(taskParameters[publishScenarioResultsTag.propName] == "true"){
			await addWebApplication(resultsDirectory, buildLabel, scenarioName, logsPath)
		}
}

async function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function threatTaskTimeout(timeoutSeconds: number){
	var passedSeconds = 0;
	while(passedSeconds < timeoutSeconds){
		await delay(10000);
		passedSeconds += 10;
	}
	await cleanExistentProcesses();
	throw new Error("Timeout has been reached! The task will be marked as failed!");
}

async function publishToArtifacts(artifactsPath:string){
	const artifactType: string = "container"
	
	let data = {
		artifacttype: artifactType,
		artifactname: artifactsLabel
	};

	data["containerfolder"] = artifactsLabel;

	data["localpath"] = artifactsPath;
	taskLibrary.command("artifact.upload", data, artifactsPath);
	
}

async function logBuildUrl(testsResultsPath: string, buildLabel: string){
	
	const scriptPath:string = path.join(__dirname, "LogBuildUrl.ps1");
	const buildEndpoint: string = buildLabel.replace(/ /g, "%20");
	const psCommand = `& "${scriptPath}" -buildEndpoint "${buildEndpoint}"`
	await execPsCommand(psCommand);
}

async function publishTask(testResultsFiles: string) {
    
	const testRunner: string = 'JUnit'
	const testRunSystem = 'VSTS - PTR';
	var properties = <{ [key: string]: string }>{};

	properties['type'] = testRunner;
	properties['resultFiles'] = testResultsFiles;
	properties['testRunSystem'] = testRunSystem;

	taskLibrary.command('results.publish', properties, '');        
}

async function run() {

    try {
		
		//const newLine: string = "=============================================================================================================="	
		
		const date: string = await getDate();
		const extensionToScenarioName: string = `-${date}`
		const logsPath = path.join(__dirname, `logs${extensionToScenarioName}.txt`);

		await prepareEnvironment(logsPath);
		
		const loadRunnerParameters: {[id: string] : string;} = await getParameters(loadRunnerTagList, logsPath);

		const taskParameters: {[id: string] : string;} = await getParameters(taskTagList, logsPath);
		
		var taskTimeout: number;
		try{
			taskTimeout = Number(taskParameters[taskTimoutTag.propName]);
		}catch(err){
			throw new Error(`Task timeout should be an integer. Given value: ${taskParameters[taskTimoutTag.propName]}`);
		}
		
		if(taskTimeout > 0){
			threatTaskTimeout(taskTimeout*60).catch(reason =>{
				console.log(reason);
				process.exit(-1);
			});
		}
		
		const allScenarios: string[] = await defineSourceScenarios(loadRunnerParameters);
		let allScenariosReportsPath:string = '';

		console.log(allScenarios);

		if(allScenarios.length == 0){
			console.log("There are no scenarios found. The execution will stop now.")
		}else{
			var errorsLogs: string = "";
			var errorMessage: string = "";
			const threatFailureAsError: boolean = taskParameters[treatFailureAsErrorTag.propName].toLowerCase() == 'true';
			const testsResultsPath: string = loadRunnerParameters[testsResultsPathTag.propName];
			const buildLabel: string = taskParameters[buildLabelTag.propName];
			const artifactsPath: string = taskParameters[buildArtifactsDirectoryTag.propName];

			const buildResultsPath: string = await formatPath(testsResultsPath, buildLabel);
			await createDirectory(buildResultsPath, logsPath);

			for (let scenarioIndex in allScenarios) {
				const scenarioName: string = allScenarios[scenarioIndex];
				const scenarioResultPath = await getScenarioResultsPath(testsResultsPath, buildLabel, scenarioName, extensionToScenarioName)
				try{
					await tryExecuteScenario(scenarioName, scenarioResultPath, loadRunnerParameters, 
						threatFailureAsError, artifactsPath, logsPath);
				}catch(err){
					errorMessage += `${scenarioName} has failed! `;
					errorsLogs += `Error: ${err.message}\n`;
				}finally{

					await handleResults(loadRunnerParameters, taskParameters, scenarioResultPath, logsPath);

					const scenarioReportPath: string = await getScenarioReportPath(scenarioResultPath, 
						loadRunnerParameters[testResultsReportTag.propName],
						taskParameters[buildTestReportsDirectoryTag.propName]);

					if(pathExists(scenarioReportPath)){
						allScenariosReportsPath += `${scenarioReportPath},`
					}
				}
			}
			
			if(taskParameters[publishScenarioResultsTag.propName] == "true"){
				await logBuildUrl(testsResultsPath, buildLabel);
			}
			
			
			const publishArtifacts: boolean = taskParameters[publishArtifactsManuallyTag.propName] == 'false'

			if(publishArtifacts){
				try{
					const artifactsPath: string = taskParameters[buildArtifactsDirectoryTag.propName];
					if(pathExists(artifactsPath)){
						publishToArtifacts(artifactsPath)
					}else{
						console.log("There are no artifacts to be published!")
					}
				}catch(err){
					errorMessage += "There was an error during artifacts upload! "
					errorsLogs += `Error: ${err.message} \n`;
				}
				
			}
			
			const publishTestsResults: boolean = taskParameters[publishTestReportsManuallyTag.propName] == 'false'

			if(publishTestsResults){
				try{
					const lastCharPosition: number = allScenariosReportsPath.length
					if(lastCharPosition > 0){
						allScenariosReportsPath = allScenariosReportsPath.substring(0, allScenariosReportsPath.length - 1)
						publishTask(allScenariosReportsPath)
					}else{
						console.log("There are no test reports to be published!")
					}
				}catch(err){
					errorMessage += "There was an error during tests results publish! "
					errorsLogs += `Error: ${err.message} \n`;
				}
				
			}
			if(errorMessage != ""){
				await appendFile(logsPath, errorsLogs);
				throw new Error(errorMessage);
			}
		}
    }
    catch (err) {
		taskLibrary.setResult(taskLibrary.TaskResult.Failed, err.message);
		process.exit();
    }
}


run();


