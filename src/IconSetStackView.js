import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';

export const IconSetStackView = GObject.registerClass({
  GTypeName: 'IcoIconSetStackView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/IconSetStackView.ui',
  Properties: {
    icons: GObject.ParamSpec.object(
      'icons',
      'Icons',
      'The list model containing the activable icons from the current icon set',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
    setName: GObject.ParamSpec.string(
      'setName',
      'Set Name',
      'The name of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    searchEntryText: GObject.ParamSpec.string(
      'searchEntryText',
      'Search Entry Text',
      'The user-inputted value of the search entry',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    sidebarVisible: GObject.ParamSpec.boolean(
      'sidebarVisible',
      'Sidebar Visible',
      'Whether the details sidebar is visible or not',
      GObject.ParamFlags.READWRITE,
      true,
    ),
  },
  InternalChildren: ['main_panel', 'toast_overlay', 'details_panel'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }

  onIconActivated(emitter, filepath, label){
	  this._details_panel.filepath = filepath;
	  this._details_panel.label = label;
	}

	onIconCopied(emitter, mimeType, data){
    // Show toast
    const toast = new Adw.Toast({
      title: "SVG copied to clipboard",
      timeout: 3,
    });

    this._toast_overlay.add_toast(toast);
    console.log(mimeType, data);

    // Copy the icon to clipboard
    // Create a new GValue
    const stringValue = new GObject.Value();
    stringValue.init(GObject.TYPE_STRING);

    // Set and get the value contents
    stringValue.set_string(data);
    console.log(stringValue.get_string());

    const clipboard = this.get_clipboard();
    clipboard.set(stringValue);
	}

});
