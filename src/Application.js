import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';

import { Window } from './Window.js';

export const Application = GObject.registerClass({
	GTypeName: 'IcoApplication'
}, class extends Adw.Application {

  vfunc_startup() {
		super.vfunc_startup();
		this.#loadSettings();
	}

	vfunc_activate() {
		const window = new Window({ application: this });
		window.present();
	}

	#loadSettings() {
    globalThis.settings = new Gio.Settings({ schemaId: this.applicationId })
  }

});

