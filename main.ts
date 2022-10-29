import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

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
                const epHead = editor.getCursor("head");
                const epAnchor = editor.getCursor("anchor");
                editor.replaceSelection(textCnv);
                editor.setSelection(epHead, epAnchor);
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new GtQuoteSettingTab(this.app, this));
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

class GtQuoteSettingTab extends PluginSettingTab {
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
