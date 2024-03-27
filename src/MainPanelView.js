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



    const filepath = GLib.build_filenamev([GLib.get_home_dir(), 'character--sentence-case.svg']);
    const file = Gio.File.new_for_path(filepath);

    const iconSetsDir = GLib.build_pathv('/', [GLib.get_home_dir(), '/icon-sets']);
    console.log(iconSetsDir);

    const carbonSetDir = GLib.build_pathv('/', [iconSetsDir, '/carbon']);
    console.log(carbonSetDir);

  		// Get an enumerator of all children
    	const children = Gio.File.new_for_path(carbonSetDir).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

    	// Iterate over the enumerator and add each child to the list store
		let fileInfo;
		while (fileInfo = children.next_file(null)) {
		  //console.log(fileInfo.get_name());
		  this._addItem(carbonSetDir + '/' + fileInfo.get_name(), fileInfo.get_display_name().replace(/\.[^/.]+$/, ""));
		}

    console.log(JSON.stringify(this.icons, null, 4));

    /*
    const file = Gio.File.new_for_uri('/com/github/azuredusk10/IconManager/icon-sets/carbon/character--sentence-case.svg');

    const [contents, etag] = await file.load_contents_async(null);

    // Do I need to do this? Or can I just pop this source into the GtkImage widget?
    // Maybe, so I can modify the colours in the SVG?
    // Or maybe I just need light and dark variants of each icon? Idk.

    const decoder = new TextDecoder('utf-8');
    const contentsString = decoder.decode(contents);
    */


  }

  _addItem(filepath, label){

    const newItem = new IconTile({
      filepath: filepath,
      label: label.substring(0, 20),
    });

    /* const newItemWrapper = new Gtk.FlowBoxChild({
      child: newItem,
    }); */

    this._iconsFlowbox.append(newItem);
  }


  onIconActivated(_flowbox, _child) {
    console.log(_child.label);
    this.emit('icon-activated', _child.filepath, _child.label);

    //console.log(child.label, child.filepath);
    // Open the details panel
    /* const application = new Gtk.Application();
    application.activate_action('win.update-icon-details-panel',
    {
      "filepath": "filepath",
      "label": "label"
    }); */
  }

});
