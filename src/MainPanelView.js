import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
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



    const icons2 = ['ico-grid-large-symbolic', 'ico-grid-large-symbolic', 'ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic'];


  }

  //icons2.forEach(icon => {
    _addItem(filepath, label){
      // FlowBoxChild -> GtkBox -> GtkLabel, GtkLabel
      const newItem = new Gtk.Box({
        css_classes: ["card", "card--icon"],
        spacing: 4,
        orientation: 1,
      });

      // TODO: Fix blurriness when pixel size is greater than the dimensions of the SVG
      newItem.append(new Gtk.Image({
          vexpand: true,
          hexpand: true,
          // icon_name: icon,
          // resource: '/com/github/azuredusk10/IconManager/icon-sets/carbon/character--sentence-case.svg',
          file: filepath,
          css_classes: ["icon-grid__image"],
          pixel_size: 24,
          margin_top: 8,
          margin_bottom: 8,
      }));

     newItem.append(new Gtk.Label({
          hexpand: false,
          label: label.substring(0, 20),
          //label,
          max_width_chars: 10,
          width_chars: 10,
          ellipsize: 3,
          css_classes: ["caption", "opacity-7", "icon-grid__label"],
          width_request: 60,
          margin_start: 4,
          margin_end: 4,
      }));

      const newItemWrapper = new Gtk.FlowBoxChild({
        child: newItem,
      });

      this._iconsFlowbox.append(newItemWrapper);
    }
   //  });

  onIconActivated(child) {
    console.log('activated!')

    // Open the details panel
  }

});
