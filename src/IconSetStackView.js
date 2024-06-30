import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';
import { deleteRecursively, byteArrayToString } from './helperFunctions.js';

Gio._promisify(Gio.File.prototype, 'make_directory_async');

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
    setLicense: GObject.ParamSpec.string(
      'setLicense',
      'Set License',
      'The license of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setAuthor: GObject.ParamSpec.string(
      'setAuthor',
      'Set author',
      'The author of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setWebsite: GObject.ParamSpec.string(
      'setWebsite',
      'Set website',
      'The website of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setId: GObject.ParamSpec.string(
      'setId',
      'Set ID',
      'The ID of the currently selected icon set',
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
    styleFilter: GObject.ParamSpec.int(
      'styleFilter',
      'Style filter',
      'The icon style to filter the set by',
      GObject.ParamFlags.READWRITE,
      0, 4,
      0
    ),
    iconPreviewScale: GObject.ParamSpec.double(
      'iconPreviewScale',
      'Icon Preview Scale',
      'The scale to render icon previews at',
      GObject.ParamFlags.READWRITE,
      0, 20,
      2
    ),
    iconsCount: GObject.ParamSpec.int(
      'iconsCount',
      'Icons Count',
      'The number of icons in this set',
      GObject.ParamFlags.READWRITE,
      0, 100000,
      1234
    )
  },
  InternalChildren: ['main_panel', 'toast_overlay', 'details_panel'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

    // Connect the icon-copied signals and pass this widget's activeIcon property gfile through
    this._main_panel.connect('icon-copied', (emitter) => this.onIconCopied(emitter, this.activeIcon.gfile));
    // this._details_panel.connect('icon-copied', (emitter) => this.onIconCopied(emitter, this.activeIcon.gfile));
    this.#setUpActions();

  }

  #setUpActions(){
    const actionGroup = new Gio.SimpleActionGroup();

    const copyAction = new Gio.SimpleAction({
		  name: 'copy',
    });
    copyAction.connect('activate', (_action, _params) => {
      this.onIconCopied(_action, this.activeIcon.gfile)
    });
    actionGroup.insert(copyAction);

    this.insert_action_group('set-view', actionGroup);
  }

  // Load all icons in the set
  checkSetIsComplete(){

    /*
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

    */
  }

  onIconActivated(emitter, icon){
    this.activeIcon = icon;
    this.notify('activeIcon');
	}

  /**
  * Copy an icon to the clipboard
  * @param ??? emitter - not used
  * @param {Gio.File} gfile - the file reference to copy to the clipboard
  **/
	async onIconCopied(emitter, gfile){

	  try {

	      let toastTitle;
	      const dataDir = GLib.get_user_data_dir();

	      const tempPath = GLib.build_filenamev([dataDir, 'temp']);
	      const tempFolder = Gio.File.new_for_path(tempPath);
        if (tempFolder.query_exists(null)){
          // If the "temp" folder already exists, delete the temporary files inside it
          console.log('clearing contents of temp folder');
          deleteRecursively(tempPath, false);
        } else {
          // Otherwise, create the "temp" folder
          console.log('creating temp folder');
          await tempFolder.make_directory_async(GLib.PRIORITY_DEFAULT, null);
        }


        // Copy the icon to clipboard

        // Create the first content provider for image/svg+xml data. Supported in Inkscape.
        // Open the resource for reading
        const fileStream = gfile.read(null);

        // Read the entire file content into bytes
        const fileSize = fileStream.query_info('standard::*', null).get_size();
        const bytes = fileStream.read_bytes(fileSize, null);

        // Create the image/svg+xml content provider
        // There was no benefit to this over the plain text ContentProvider, so I have removed it for now.
        // const contentProviderSvg = Gdk.ContentProvider.new_for_bytes('image/svg+xml', bytes.get_data());

        // Also create a plain string content provider, for use in coding apps
        const textValue = new GObject.Value();
        textValue.init(GObject.TYPE_STRING);
        textValue.set_string(byteArrayToString(bytes.get_data()));
        const contentProviderString = Gdk.ContentProvider.new_for_value(textValue);

        // Create another content provider for a file reference to a temporary file, for apps that can't handle svg data directly, e.g. Figma.
        const tempFile = Gio.File.new_for_path(GLib.build_filenamev([tempPath, gfile.get_basename()]));
        const outputStream = tempFile.replace(null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
        outputStream.write_bytes(bytes, null);

        // Create a new GValue with the temp file as its content
        const fileValue = new GObject.Value();
        fileValue.init(Gio.File);
        fileValue.set_object(tempFile);

        // Create the file content provider
        const contentProviderFile = Gdk.ContentProvider.new_for_value(fileValue);

        // Create a union of all content providers, preferring the file provider over the image/svg+xml provider and the string provider.
        //const contentProviderUnion = Gdk.ContentProvider.new_union([contentProviderString, contentProviderFile]);
        // console.log(contentProviderUnion.ref_formats().get_mime_types());

        // Unfortunately, all apps seemed to prefer the file reference over the plain string in the above union, meaning that you could not copy the SVG and paste it into a code editor - it would paste in the path to the temporary file - so I have dropped the file content provider. This means that icon code can be copied and pasted into code as well as into design tools, but that copying and pasting into the file manager will not work.
        const contentProviderUnion = Gdk.ContentProvider.new_union([contentProviderString]);

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
    } catch(e){
      console.log('Error copying to clipboard: ' + e);
    }
	}


});


