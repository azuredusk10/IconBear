import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

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
      'Carbon'
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
    iconPreviewSize: GObject.ParamSpec.int(
      'iconPreviewSize',
      'Icon Preview Size',
      'The size to render icon previews at',
      GObject.ParamFlags.READWRITE,
      0, 1024,
      24
    ),
    iconsCount: GObject.ParamSpec.int(
      'iconsCount',
      'Icons Count',
      'The number of icons in this set',
      GObject.ParamFlags.READWRITE,
      0, 100000,
      1234
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

  onIconActivated(emitter, label, icon){
    this.activeIcon = icon;

	  this._details_panel.label = label;
	  this._details_panel.icon = icon;
	}

	onIconCopied(emitter, gfile){

	  let toastTitle;

    // Copy the icon to clipboard

    // Create the first content provider for image/svg+xml data. Supported in Inkscape.
    // Open the resource for reading
    const fileStream = gfile.read(null);

    // Read the entire file content into bytes
    const fileSize = fileStream.query_info('standard::*', null).get_size();
    const bytes = fileStream.read_bytes(fileSize, null);

    // Create the image/svg+xml content provider
    const contentProviderData = Gdk.ContentProvider.new_for_bytes('image/svg+xml', bytes.get_data());


    // Create the second content provider for a file reference. Supported in Figma.
    // Create a temporary file with the contents of the icon resource file
    const dataDir = GLib.get_user_data_dir();
    const tempFile = Gio.File.new_for_path(dataDir + '/temp.svg');
    const outputStream = tempFile.replace(null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    outputStream.write_bytes(bytes, null);

    // Create a new GValue with the temp file as its content
    const value = new GObject.Value();
    value.init(Gio.File);
    value.set_object(tempFile);

    // Create the file content provider
    const contentProviderFile = Gdk.ContentProvider.new_for_value(value);

    // Create a union of the two content providers, preferring the file provider over the image/svg+xml provider.
    const contentProviderUnion = Gdk.ContentProvider.new_union([contentProviderFile, contentProviderData]);

    // console.log(contentProviderUnion.ref_formats().get_mime_types());

    // Copy the icon to the clipboard
    const clipboard = this.get_clipboard();
    if(clipboard.set_content(contentProviderUnion)){
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

