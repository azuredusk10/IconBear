import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';

import './MainPanelView.js';
import './SidebarView.js';
import './DetailsPanel.js';
import './IconTile.js';
import './AllSetsStackView.js';
import './IconSetStackView.js';
import './AddSetDialog.js';
import { Window } from './Window.js';


export const Application = GObject.registerClass({
	GTypeName: 'IcoApplication'
}, class extends Adw.Application {

  vfunc_startup() {
		super.vfunc_startup();
		this.#loadSettings();
		this.#loadStylesheet();
		this.#initializeAccelerators();
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
		provider.load_from_resource('/design/chris_wood/IconBear/css/style.css');

		// Add the provider to the StyleContext of the default display
		Gtk.StyleContext.add_provider_for_display(
			Gdk.Display.get_default(),
			provider,
			Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
		);
	}

	#initializeAccelerators(){
	  this.set_accels_for_action('window.close', ['<Control>w']);
	  this.set_accels_for_action('win.add_set', [ '<Ctrl>o' ]);
	  this.set_accels_for_action('win.clear_filters', [ '<Ctrl>1' ]);
	  this.set_accels_for_action('win.filter_by_style(1)', [ '<Ctrl>2' ]);
	  this.set_accels_for_action('win.filter_by_style(2)', [ '<Ctrl>3' ]);
	  this.set_accels_for_action('win.filter_by_style(3)', [ '<Ctrl>4' ]);
	  this.set_accels_for_action('win.filter_by_style(4)', [ '<Ctrl>5' ]);
	}

});

