import { App, MarkdownPostProcessorContext, MarkdownRenderChild, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { parseSong, renderSong } from 'chord-mark/lib/chord-mark.js';


interface ChordMarkPluginSettings {
	theme: string;
}

const DEFAULT_SETTINGS: ChordMarkPluginSettings = {
	theme: 'cmTheme-dark1'
}

export default class ChordMarkPlugin extends Plugin {
	settings: ChordMarkPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("chord-mark", this.codeProcessor); 

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ChordMarkSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async codeProcessor (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		ctx.addChild(new ChordMarkRender(source, el, "cmTheme-dark1"));
		
	}
}

class ChordMarkRender extends MarkdownRenderChild {
  
	constructor(
		private readonly source: string,
		private readonly el: HTMLElement,
		private readonly theme: string,
	) {
		super(el); // important
	}
  
	onload() {
		const parsed = parseSong(this.source);
		const rendered = renderSong(parsed);
		let div = document.createElement('div');
		div.addClass(this.theme);
		div.setAttribute("font-family", "monospace");
		div.innerHTML = rendered;
		this.el.appendChild(div);
	}

}
  

class ChordMarkSettingTab extends PluginSettingTab {
	plugin: ChordMarkPlugin;

	constructor(app: App, plugin: ChordMarkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('Chord-Mark theme to use')
			.addText(text => text
				.setPlaceholder('cmTheme-dark1')
				.setValue(this.plugin.settings.theme)
				.onChange(async (value) => {
					this.plugin.settings.theme = value;
					await this.plugin.saveSettings();
				}));
	}
}
