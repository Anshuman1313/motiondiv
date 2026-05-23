// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const helloWorld = vscode.commands.registerCommand('motiondiv.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from MotionDiv!');
	});

	const convertCommand = vscode.commands.registerCommand(
		'motiondiv.convertDiv',
		async () => {
			const message = await vscode.window.showInputBox({
				placeHolder: "enter name"
			});
			vscode.window.showInformationMessage(`My name is ${message}`);

			
		}
	);

	context.subscriptions.push(convertCommand,helloWorld);
}

// This method is called when your extension is deactivated
export function deactivate() {}
