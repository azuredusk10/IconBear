import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///com/github/azuredusk10/IconManager/ui/Window.ui',
	InternalChildren: ['details_panel', 'toast_overlay'],
}, class extends Adw.ApplicationWindow {
  constructor(params={}){
    super(params);
    this.#bindSizeToSettings();
    this.#setupActions();

  }

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}


	#bindSizeToSettings(){
	  settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
	  settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}

	#setupActions(){
	  // Copy an icon to the clipboard.
	  // Not used right now, but will be useful when adding menus, and linking up "Copy to clipboard" buttons.
	  // Use a signal for the double-click action.
	  // @params [mimeType<String>, imageData<String>]
	  // TODO: The action on IconTile.ui context menu is greyed out because the parameter type isn't right. It thinks the action is a string (s), when it's actually an array of strings (as) or an object (a{ss}).
	  const copyIconAction = new Gio.SimpleAction({
	    name: 'copy-icon',
	    parameterType: GLib.VariantType.new('a{ss}'),
	  });

    copyIconAction.connect('activate', (_action, params) => {
      // Code to copy the item to the clipboard goes here

      console.log(params.recursiveUnpack());

      // Show toast
      const toast = new Adw.Toast({
        title: "SVG copied to clipboard",
        timeout: 3,
      });

      this._toast_overlay.add_toast(toast);
    });

    // Add action to window
	  this.add_action(copyIconAction);
	}

	onIconActivated(emitter, filepath, label){
	  this._details_panel.filepath = filepath;
	  this._details_panel.label = label;
	}

});

