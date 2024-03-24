import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///com/github/azuredusk10/IconManager/ui/Window.ui',
}, class extends Adw.ApplicationWindow {
  constructor(params={}){
    super(params);
    this.#bindSizeToSettings();
  }

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}


	#bindSizeToSettings(){
	  settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
	  settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}
});

