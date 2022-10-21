import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface GtQuoteSettings {
    quoteString: string;
}

const DEFAULT_SETTINGS: GtQuoteSettings = {
    quoteString: '>'
}

export default class GtQuote extends Plugin {
    settings: GtQuoteSettings;

    async onload() {
        await this.loadSettings();

        // This creates an icon in the left ribbon.
        // const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
        //     // Called when the user clicks the icon.
        //     new Notice('This is a notice!');
        // });

        // Perform additional things with the ribbon
        // ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        // const statusBarItemEl = this.addStatusBarItem();
        // statusBarItemEl.setText('Status Bar Text');

        // This adds a simple command that can be triggered anywhere
        // this.addCommand({
        //     id: 'open-sample-modal-simple',
        //     name: 'Open sample modal (simple)',
        //     callback: () => {
        //         new SampleModal(this.app).open();
        //     }
        // });
        // Command : quoted paste
        this.addCommand({
            id: 'quoted-paste',
            name: 'quoted paste',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const electron = require('electron');
                const clipboard = electron.clipboard;
                const text = clipboard.readText();
                const aText = text.split(/\r\n|\n/);
                let textCnv = "";
                for (var i = 0; i < aText.length; i ++) {
                    if (i == aText.length - 1 && aText[i] == "") continue;
                    const cr = (i == aText.length - 1 && !text.endsWith("\n")) ? "" : "\n";
                    textCnv += this.settings.quoteString + aText[i] + cr;
                }
                editor.replaceSelection(textCnv);
            }
        });
        // Command : quote toggle
        this.addCommand({
            id: 'quote-toggle',
            name: 'quote toggle',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const text = editor.getSelection();
                const aText = text.split(/\r\n|\n/);
                let bAddQuote = false;
                for (var i = 0; i < aText.length; i ++) {
                    if (i == aText.length - 1 && aText[i] == "") continue;
                    if (!aText[i].startsWith(this.settings.quoteString)) {
                        bAddQuote = true;
                        break;
                    }
                }
                let textCnv = "";
                for (var i = 0; i < aText.length; i ++) {
                    if (i == aText.length - 1 && aText[i] == "") continue;
                    const cr = (i == aText.length - 1 && !text.endsWith("\n")) ? "" : "\n";
                    // Add
                    if (bAddQuote) {
                        textCnv += this.settings.quoteString + aText[i] + cr;
                    }
                    // Sub
                    else {
                        textCnv += aText[i].substring(this.settings.quoteString.length) + cr;
                    }
                }
                const epFrom = editor.getCursor("head");
                const epAnchor = editor.getCursor("anchor");
                editor.replaceSelection(textCnv);
                // editor.setCursor(epFrom);
                // if (epAnchor.line > epFrom.line)
                //     editor.setSelection(epAnchor, epFrom);
                // else
                    editor.setSelection(epFrom, epAnchor);
            }
        });
        // This adds an editor command that can perform some operation on the current editor instance
        // this.addCommand({
        //     id: 'sample-editor-command',
        //     name: 'Sample editor command',
        //     editorCallback: (editor: Editor, view: MarkdownView) => {
        //         console.log(editor.getSelection());
        //         editor.replaceSelection('Sample Editor Command');
        //     }
        // });
        // This adds a complex command that can check whether the current state of the app allows execution of the command
        // this.addCommand({
        //     id: 'open-sample-modal-complex',
        //     name: 'Open sample modal (complex)',
        //     checkCallback: (checking: boolean) => {
        //         // Conditions to check
        //         const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        //         if (markdownView) {
        //             // If checking is true, we're simply "checking" if the command can be run.
        //             // If checking is false, then we want to actually perform the operation.
        //             if (!checking) {
        //                 new SampleModal(this.app).open();
        //             }

        //             // This command will only show up in Command Palette when the check function returns true
        //             return true;
        //         }
        //     }
        // });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
        //     console.log('click', evt);
        // });

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        // this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// class SampleModal extends Modal {
//     constructor(app: App) {
//         super(app);
//     }

//     onOpen() {
//         const { contentEl } = this;
//         contentEl.setText('Woah!');
//     }

//     onClose() {
//         const { contentEl } = this;
//         contentEl.empty();
//     }
// }

class SampleSettingTab extends PluginSettingTab {
    plugin: GtQuote;

    constructor(app: App, plugin: GtQuote) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Settings for GT Quote plugin.' });

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('Quote string')
            .addText(text => text
                .setPlaceholder('Enter quote string')
                .setValue(this.plugin.settings.quoteString)
                .onChange(async (value) => {
                    // console.log('Secret: ' + value);
                    this.plugin.settings.quoteString = value;
                    await this.plugin.saveSettings();
                }));
    }
}
