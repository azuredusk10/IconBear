import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';

import './MainPanelView.js';
import './SidebarView.js';
import './DetailsPanel.js';
import './IconTile.js';
import './IconPaintable.js';
import { Window } from './Window.js';


export const Application = GObject.registerClass({
	GTypeName: 'IcoApplication'
}, class extends Adw.Application {

  vfunc_startup() {
		super.vfunc_startup();
		this.#loadSettings();
		this.#loadStylesheet();
	}

	vfunc_activate() {
		const window = new Window({ application: this });
		window.present();
	}

	#loadSettings() {
    globalThis.settings = new Gio.Settings({ schemaId: this.applicationId })
  }

  #loadStylesheet() {
		// Load the stylesheet in a CssProvider
		const provider = new Gtk.CssProvider();
		provider.load_from_resource('/com/github/azuredusk10/IconManager/css/style.css');

		// Add the provider to the StyleContext of the default display
		Gtk.StyleContext.add_provider_for_display(
			Gdk.Display.get_default(),
			provider,
			Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
		);
	}

});

