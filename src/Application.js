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
import './PreferencesDialog.js';
import './SkeletonStackView.js';
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
	  this.set_accels_for_action('win.clear_filters', [ '<Ctrl>r' ]);
	  this.set_accels_for_action('win.filter_by_style(0)', [ '<Ctrl>1' ]);
	  this.set_accels_for_action('win.filter_by_style(1)', [ '<Ctrl>2' ]);
	  this.set_accels_for_action('win.filter_by_style(2)', [ '<Ctrl>3' ]);
	  this.set_accels_for_action('win.filter_by_style(3)', [ '<Ctrl>4' ]);
	  this.set_accels_for_action('win.filter_by_style(4)', [ '<Ctrl>5' ]);
	  this.set_accels_for_action('win.open_preferences_dialog', [ '<Ctrl>comma' ]);
	  this.set_accels_for_action('win.focus_search_entry', [ '<Ctrl>f' ]);
	  this.set_accels_for_action('win.increase_icon_preview_scale', [ '<Ctrl>equal' ]);
	  this.set_accels_for_action('win.decrease_icon_preview_scale', [ '<Ctrl>minus' ]);
	  this.set_accels_for_action('win.reset_icon_preview_scale', [ '<Ctrl>0' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(0)', [ '<Alt>1' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(1)', [ '<Alt>2' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(2)', [ '<Alt>3' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(3)', [ '<Alt>4' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(4)', [ '<Alt>5' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(5)', [ '<Alt>6' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(6)', [ '<Alt>7' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(7)', [ '<Alt>8' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(8)', [ '<Alt>9' ]);
	  this.set_accels_for_action('win.open_stack_page_by_index(9)', [ '<Alt>0' ]);
	}

});

