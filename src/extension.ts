// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const helloWorld = vscode.commands.registerCommand('motiondiv.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from MotionDiv!');
	});

	// what we are doing is going line by line to find imort we can use getText() but that will fetch the whole document 
	// which is not needed so i decided to go with wth for loop way to look at each line to go and find the line and index
	// at which what i need is placed and then we replace using edit replace to do that i need range 
	// that we found out using for loop as we now know the line number and the character number where it stars like at what point we wanna replace 
	// new vscode.Position(1,0) ->meand first line zero character we practiced a bit of this for use client

	async function replaceFramerMotionImport(
		editor: vscode.TextEditor
	) {
		vscode.window.showInformationMessage("replaceFramerMotionImport - ✅")
		for (let i = 0; i < editor.document.lineCount; i++) {

			const line = editor.document.lineAt(i);

			if (line.text.includes("framer-motion")) {
				const start = line.text.indexOf("framer-motion");

				const range = new vscode.Range(
					new vscode.Position(i, start),
					new vscode.Position(
						i,
						start + "framer-motion".length
					)
				);

				await editor.edit(editBuilder => {
					editBuilder.replace(
						range,
						"motion/react"
					);
				});

				return true;
			}
		}

		return false;
	}

	async function ensureUseClient(
		editor: vscode.TextEditor
	) {
		vscode.window.showInformationMessage("ensureUseClient - ✅")
		const firstLine =
			editor.document.lineAt(0).text;

		const hasUseClient =
			firstLine.includes("use client");

		if (!hasUseClient) {
			await editor.edit(editBuilder => {
				editBuilder.insert(
					new vscode.Position(0, 0),
					'"use client"\n'
				);
			});
		}
	}

	const convertCommand = vscode.commands.registerCommand(
		'motiondiv.convertDiv',
		async () => {
			
			const editor = vscode.window.activeTextEditor
			
			if (!editor) {
				vscode.window.showErrorMessage("No editor opened")
				return;
			}
			await ensureUseClient(editor);
			await replaceFramerMotionImport(editor);

		}
	);

	context.subscriptions.push(convertCommand, helloWorld);
}

// This method is called when your extension is deactivated
export function deactivate() { }
