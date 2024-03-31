import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///com/github/azuredusk10/IconManager/ui/Window.ui',
	InternalChildren: ['details_panel', 'main_panel', 'sidebar_panel', 'toast_overlay', 'search_entry'],
	Properties: {
	  currentSetIcons: GObject.ParamSpec.object(
      'currentSetIcons',
      'Current Set Icons',
      'The list model containing the icons in the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
    currentSetName: GObject.ParamSpec.string(
      'currentSetName',
      'Current Set Name',
      'The name of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    iconSize: GObject.ParamSpec.double(
      'iconSize',
      'Icon Size',
      'The size to render icons in the grid at',
      GObject.ParamFlags.READWRITE,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
      24
    ),
	}
}, class extends Adw.ApplicationWindow {
  constructor(params={}){
    super(params);
    this.#bindSizeToSettings();
    this.#setupActions();
    this.#initializeIcons();
    this.#initializeMainStack();

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


	#initializeIcons() {

    this.currentSetIcons = Gio.ListStore.new(Icon);

    const iconSetsDir = GLib.build_pathv('/', [GLib.get_home_dir(), '/icon-sets']);
    console.log(iconSetsDir);

    const carbonSetDir = GLib.build_pathv('/', [iconSetsDir, '/carbon']);
    console.log(carbonSetDir);

  		// Get an enumerator of all children
    	const children = Gio.File.new_for_path(carbonSetDir).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);


		let fileInfo;
		let i=0;
		while (fileInfo = children.next_file(null)) {
		  if(i < 50){
		    const label = fileInfo.get_display_name().replace(/\.[^/.]+$/, "");

		      const icon = new Icon({
		        label,
		        filepath: carbonSetDir + '/' + fileInfo.get_name(),
		      });

		      // TODO: Using the list store's splice method to add all icons at once would be more efficient.
		      // Although, the part that's causing a bottleneck in the application opening is actually opening the file / rendering the IconTiles. Work out how to do this asynchronously.
		      this.currentSetIcons.append(icon);

		      console.log('adding "' + label + '" to list store');

		      i++;
	    }
		}

		// This will tell the Main Panel that the icons have been fully processed
		this.notify('currentSetIcons');

  }

  #initializeMainStack(){
    this._sidebar_panel._main_stack_sidebar.stack = this._main_panel._main_stack;

    // The list isn't updating. I probably won't use it anyway to change the view, so may as well scrap it. Nice to know I can map IDs in child composite widgets anyway.
  }

	onIconActivated(emitter, filepath, label){
	  this._details_panel.filepath = filepath;
	  this._details_panel.label = label;
	}

	onSearchEntrySearchChanged() {
	  const searchEntryText = this._search_entry.text;
    this._main_panel.searchEntryText = this._search_entry.text;
	}

	onIconSizeChanged(_scale){

	  this.iconSize = _scale.get_value();

	  console.log(this.iconSize);
	  // this.notify('iconSize');
	}

});

