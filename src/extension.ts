import * as vscode from "vscode";

/**
 * Prompts the user for the desired characters.
 */
const promptCharacters = () => {
    vscode.window
        .showInputBox({
            title: "Pad to Column",
            prompt: "Character to insert",
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return "Invalid input.";
                }
            },
        })
        .then((characters) => {
            if (characters) {
                promptColumn(characters);
            }
        });
};

/**
 * Prompts the user for the desired column.
 * @param characters provided characters from {@link promptCharacters()}
 */
const promptColumn = (characters: string) => {
    vscode.window
        .showInputBox({
            title: "Pad to Column",
            prompt: "Column to pad to",
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (value !== "") {
                    const parsed = parseInt(value);

                    if (isNaN(parsed)) {
                        return "Value must be a number.";
                    }

                    if (parsed < 1) {
                        return "Value must be more than 0.";
                    }
                }
            },
        })
        .then((columnString) => {
            if (columnString) {
                const column = parseInt(columnString);
                insert(characters, column);
            }
        });
};

/**
 * Insert the provided characters up to the given column.
 * @param characters characters to insert
 * @param column column to insert to
 */
const insert = (characters: string, column: number) => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        editor.edit((builder) => {
            let lastLine = -1;

            editor.selections.forEach((selection) => {
                console.log(lastLine, selection.active.line);

                if (
                    lastLine !== selection.active.line &&
                    column >= selection.active.character
                ) {
                    // calculate number of characters to insert
                    const fullLength = column - selection.active.character - 1;
                    // calculate how many times to insert characters
                    const repeatCount = Math.ceil(
                        fullLength / characters.length
                    );

                    if (fullLength >= 0 && repeatCount >= 0) {
                        builder.insert(
                            selection.end,
                            characters.repeat(repeatCount).slice(0, fullLength)
                        );

                        lastLine = selection.active.line;
                    }
                }
            });
        });
    }
};

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating "pad-to-column".');

    let padLines = vscode.commands.registerCommand(
        "padToColumn.padLines",
        () => {
            promptCharacters();
        }
    );

    let padLinesWithDefaultValues = vscode.commands.registerCommand(
        "padToColumn.padLinesWithDefaultValues",
        () => {
            const config = vscode.workspace.getConfiguration("padToColumn");
            const defaultCharacters = config.get<string>("defaultCharacters");
            const defaultColumn = config.get<number>("defaultColumn");

            if (defaultCharacters && defaultColumn) {
                insert(defaultCharacters, defaultColumn);
            }
        }
    );

    context.subscriptions.push(padLines);
    context.subscriptions.push(padLinesWithDefaultValues);
}

export function deactivate() {}
