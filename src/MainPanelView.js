import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { IconTile } from './IconTile.js';
import { Icon } from './Icon.js';

export const MainPanelView = GObject.registerClass({
  GTypeName: 'IcoMainPanelView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/MainPanelView.ui',
  InternalChildren: ['iconsFlowbox'],
  Properties: {
    icons: GObject.ParamSpec.object(
      'icons',
      'Icons',
      'The list model containing the icons',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
  },
  Signals: {
    'icon-activated': {
      param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING]
    },
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.#initializeIcons()
  }

  #initializeIcons() {

    this.icons = Gio.ListStore.new(Icon);

    const iconSetsDir = GLib.build_pathv('/', [GLib.get_home_dir(), '/icon-sets']);
    console.log(iconSetsDir);

    const carbonSetDir = GLib.build_pathv('/', [iconSetsDir, '/carbon']);
    console.log(carbonSetDir);

  		// Get an enumerator of all children
    	const children = Gio.File.new_for_path(carbonSetDir).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

    	// Add an IconTile to the FlowBox for the first 50 icon files in the directory
		let fileInfo;
		let i=0;
		while (fileInfo = children.next_file(null)) {
		  if(i < 50){
		    this._addItem(carbonSetDir + '/' + fileInfo.get_name(), fileInfo.get_display_name().replace(/\.[^/.]+$/, ""));
		    i++;
	    }
		}
  }

  _addItem(filepath, label){

    const newItem = new IconTile({
      filepath: filepath,
      label: label.substring(0, 20),
    });

    this._iconsFlowbox.append(newItem);
  }


  onIconActivated(_flowbox, _child) {
    this.emit('icon-activated', _child.filepath, _child.label);
  }

});
