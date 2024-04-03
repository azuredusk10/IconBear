import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';

export const IconSetStackView = GObject.registerClass({
  GTypeName: 'IcoIconSetStackView',
  Template: 'resource:///design/chris_wood/IconBear/ui/IconSetStackView.ui',
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
    setId: GObject.ParamSpec.string(
      'setId',
      'Set ID',
      'The id of the currently selected icon set',
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
    maxPreviewIcons: GObject.ParamSpec.int(
      'maxPreviewIcons',
      'Max Preview Icons',
      'The maximum number of items to show when previewing a set',
      GObject.ParamFlags.READWRITE,
      0, 100,
      12
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

  loadAllIcons(){
    // Open the icon bundle resource Dir
    const bundledIconsDir = '/design/chris_wood/IconBear/icon-sets/';
    const resourceDir = bundledIconsDir + this.setId;
    const iconsDir = resourceDir + '/icons/';
    const iconFilenames = Gio.resources_enumerate_children(iconsDir, 0);

    // Don't proceed if we have already loaded all icons
    console.log(this.iconsCount, iconFilenames.length)
    if(this.icons.n_items === iconFilenames.length) {
      console.log('already loaded all icons');
      return;
    }

    // Remove the icons from the array which have already been loaded during initial app load
    iconFilenames.sort();
    iconFilenames.splice(0, this.maxPreviewIcons);

    const iconsArray = [];


    // Load all icons into the icons list store property in alphabetical order
    iconFilenames.forEach(iconFilename => {

      // Create the Gio.File for this icon resource and get its file info
      const iconFile = Gio.File.new_for_uri('resource://' + iconsDir + iconFilename);
      const fileInfo = iconFile.query_info('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

      const label = iconFilename.replace(/\.[^/.]+$/, "");

      // Create a new Icon
      const icon = new Icon({
        label,
        filepath: iconsDir + iconFilename,
        type: fileInfo.get_file_type(),
        gfile: iconFile,
      });

      iconsArray.push(icon);

    });

    // Add the loaded icons into the list store
    this.icons.splice(this.maxPreviewIcons, 0, iconsArray);

    this.notify('icons');

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

