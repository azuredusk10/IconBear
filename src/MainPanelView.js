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
    searchEntryText: GObject.ParamSpec.string(
      'searchEntryText',
      'Search Entry Text',
      'The user-inputted value of the search entry',
      GObject.ParamFlags.READWRITE,
      ''
    )
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
    this._iconsFlowbox.bind_model(this.icons, this._addItem);

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
		    const icon = new Icon({
		      label: fileInfo.get_display_name().replace(/\.[^/.]+$/, ""),
		      filepath: carbonSetDir + '/' + fileInfo.get_name(),
		    });
		    this.icons.append(icon);
		    i++;
	    }
		}
  }

  // Create a new child of the Flowbox
  // TODO: correctly populate the list model. Then, the arguments to just "item" that represents a single item of the model (See Gtk.FlowBoxCreateWidgetFunc docs)
  _addItem(icon){

    const newItem = new IconTile({
      filepath: icon.filepath,
      label: icon.label.substring(0, 20),
    });

    return newItem;
  }


  onIconActivated(_flowbox, _child) {
    this.emit('icon-activated', _child.filepath, _child.label);
  }

  _filter(item) {
    const re = new RegExp(searchEntryText, "i");
    const match = re.test(item.label);
    // if (match) results_count++;
    return match;
  }

});
