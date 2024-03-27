import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///com/github/azuredusk10/IconManager/ui/Window.ui',
	InternalChildren: ['details_panel'],
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

	onIconActivated(emitter, filepath, label){
	  this._details_panel.filepath = filepath;
	  this._details_panel.label = label;
	}

	#setupActions(){
	  const updateIconDetailsPanelAction = new Gio.SimpleAction({
	    name: 'update-icon-details-panel',
	    parameterType: GLib.VariantType.new('a{ss}'),
	  })

	  updateIconDetailsPanelAction.connect('activate', (_action, params) => {
	    const paramsObject = params.recursiveUnpack();
	    console.log(paramsObject);
	    console.log(this._details_panel.label);
      this._details_panel.filepath = paramsObject.filepath;
      this._details_panel.label = paramsObject.label;
	  })

	  	this.add_action(updateIconDetailsPanelAction);
	}
});

