// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {



	// what we are doing is going line by line to find imort we can use getText() but that will fetch the whole document 
	// which is not needed so i decided to go with wth for loop way to look at each line to go and find the line and index
	// at which what i need is placed and then we replace using edit replace to do that i need range 
	// that we found out using for loop as we now know the line number and the character number where it stars like at what point we wanna replace 
	// new vscode.Position(1,0) ->meand first line zero character we practiced a bit of this for use client

	async function replaceFramerMotionImport(
		editor: vscode.TextEditor
	) {
		let hasMotionImport = false;

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

				return;

			}

			if (line.text.includes("motion/react")) {
				hasMotionImport = true;
				break;
			}
		}

		if (hasMotionImport) {
			return;
		}

		// Insert new import
		await editor.edit(editBuilder => {
			editBuilder.insert(
				new vscode.Position(1, 0),
				"import { motion } from 'motion/react';\n"
			);
		});
	}

	async function ensureUseClient(
		editor: vscode.TextEditor
	) {
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

			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				vscode.window.showErrorMessage("No editor opened");
				return;
			}
			// await ensureUseClient(editor);
			await replaceFramerMotionImport(editor);

			const cursorLine = editor.selection.active.line;
			const currentLine = editor.document.lineAt(cursorLine);

			//check that user must be on opening div so that i don't have that issue of closing div

			if (!currentLine.text.includes("<div")) {
				vscode.window.showErrorMessage(
					"MotionDiv: Place cursor on an opening <div> tag."
				);
				return;
			}



			const openingStart = currentLine.text.indexOf("<div");
			const closingStart = currentLine.text.indexOf("</div>");


			// Both opening and closing on same line ex-> <div> Heelo </div>

			if (openingStart !== -1 && closingStart !== -1) {
				const openingRange = new vscode.Range(
					new vscode.Position(cursorLine, openingStart),
					new vscode.Position(
						cursorLine,
						openingStart + "<div".length
					)
				);
				const closingRange = new vscode.Range(
					new vscode.Position(cursorLine, closingStart),
					new vscode.Position(
						cursorLine,
						closingStart + "</div>".length
					)
				);

				await editor.edit(editBuilder => {
					editBuilder.replace(
						openingRange,
						"<motion.div"
					);

					editBuilder.replace(
						closingRange,
						"</motion.div>"
					);
				});
				// vscode.window.showInformationMessage(
				// 	"Same-line Opening div converted"
				// );

				//getting cursor after <motion.div  so that user can write initial and animate by himself

				const cursorPosition = new vscode.Position(cursorLine, openingStart + "<motion.div".length);

				// as anchor === active as we need no selection just cursor 
				editor.selection = new vscode.Selection(cursorPosition, cursorPosition);

				return;

			}



			// Only Opening tag
			if (openingStart !== -1) {
				const range = new vscode.Range(
					new vscode.Position(cursorLine, openingStart),
					new vscode.Position(
						cursorLine,
						openingStart + "<div".length
					)
				);

				await editor.edit(editBuilder => {
					editBuilder.replace(
						range,
						"<motion.div"
					);
				});
				// vscode.window.showInformationMessage(
				// 	"MotionDiv: Place cursor on an opening <div> tag."
				// );

				//getting cursor after <motion.div  so that user can write initial and animate by himself

				const cursorPosition = new vscode.Position(cursorLine, openingStart + "<motion.div".length);

				// as anchor === active as we need no selection just cursor 
				editor.selection = new vscode.Selection(cursorPosition, cursorPosition);

			}

			// Multi line case 
			// <div>
			// 	  Hello
			// </div>

			let depth = 1;

			for (let i = cursorLine + 1; i < editor.document.lineCount; i++) {

				//i used cursorLine + 1 this because i am assuming the case give below  
				// <div>      ← cursor here
				// 	 Hello
				// </div>
				// this is the edge case that is not considered here like this <div>Hello </div> 
				// as you can see the cursor starts from below not on same line 

				const line = editor.document.lineAt(i); //we get the line where our cursor is now like moving downwards

				//edge case if insite multi line there is a closing tag <div/>
				const isSelfClosingDiv =  line.text.includes("<div") && line.text.includes("/>");

				if (line.text.includes("<div") && !isSelfClosingDiv) {
					depth++; //we found another opeing div so we increasse the depth 

					// vscode.window.showInformationMessage(`Opening DIV at line ${i + 1} and depth count ${depth}`);

				}

				if (line.text.includes("</div>")) {
					depth--; //we found some closing div but we don't know if that is our matching closing div

					// vscode.window.showInformationMessage(`Closing DIV at line ${i + 1} and depth count ${depth}`);
				}

				if (depth === 0) {
					// vscode.window.showInformationMessage(`Found closing div at line ${i + 1}`);

					const start = line.text.indexOf("</div>");

					if (start !== -1) {
						const range = new vscode.Range(
							new vscode.Position(i, start),
							new vscode.Position(i, start + "</div>".length)
						);

						await editor.edit((editBuilder) => {
							editBuilder.replace(range, "</motion.div>");
						});

						// vscode.window.showInformationMessage(`Multi line closing div converted at line number ${i + 1}`)
						// vscode.window.showInformationMessage(`We changed the line to motion div at linenumber ${i + 1}`);
					}

					break;
					//we are using break not return here why because return will return us from command so after that nothing will run 
					//i am using break because this loop will break if something is after this loop that will still work
				}

			}

		}
	);

	context.subscriptions.push(convertCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }
