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
    activeIcon: GObject.ParamSpec.object(
      'activeIcon',
      'Active Icon',
      'The Icon in GObject format that is currently selected',
      GObject.ParamFlags.READWRITE,
      GObject.Object
    ),
    maxPreviewIcons: GObject.ParamSpec.int(
      'maxPreviewIcons',
      'Max Preview Icons',
      'The maximum number of items to show when previewing a set',
      GObject.ParamFlags.READWRITE,
      0, 100,
      16
    ),
  },
  InternalChildren: ['main_panel', 'toast_overlay', 'details_panel'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

    // Connect the icon-copied signals and pass this widget's activeIcon property gfile through
    this._main_panel.connect('icon-copied', (emitter) => this.onIconCopied(emitter, this.activeIcon.gfile));
    this._details_panel.connect('icon-copied', (emitter) => this.onIconCopied(emitter, this.activeIcon.gfile));
  }

  onIconActivated(emitter, label, filepath, icon){
    this.activeIcon = icon;

	  this._details_panel.label = label;
	  this._details_panel.filepath = filepath;
	  this._details_panel.icon = icon;
	}

	onIconCopied(emitter, gfile){

	  let toastTitle;

    // Copy the icon to clipboard
    // Create a new GValue
    const value = new GObject.Value();
    value.init(Gio.File);

    // Set and get the value contents
    value.set_object(gfile);
    const contentProvider = Gdk.ContentProvider.new_for_value(value);

    // Copy the icon to the clipboard
    const clipboard = this.get_clipboard();
    if(clipboard.set_content(contentProvider)){
      toastTitle = "SVG copied to clipboard";
    } else {
      toastTitle = "Couldn't copy the SVG to clipboard";
    }

    // Show toast
    const toast = new Adw.Toast({
      title: toastTitle,
      timeout: 3,
    });

    this._toast_overlay.add_toast(toast);
	}

});

