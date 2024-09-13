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
      parameter_type: new GLib.VariantType('i'),
    });
    copyAction.connect('activate', (action, param) => {
      this.onIconCopied(action, this.activeIcon.gfile, param.unpack());
    });

    actionGroup.insert(copyAction);

    // Copies the icon using the user-defined preferred copy method
    const copyWithPreferredMethodAction = new Gio.SimpleAction({
       name: 'copy_with_preferred_method',
    });
    copyWithPreferredMethodAction.connect('activate', (action) => {
      this.onIconCopied(action, this.activeIcon.gfile);
    });

    actionGroup.insert(copyWithPreferredMethodAction);

    // Copies the icon with the non-preferred copy method
    const copyWithAltMethodAction = new Gio.SimpleAction({
       name: 'copy_with_alt_method',
    });
    copyWithAltMethodAction.connect('activate', (action) => {
      let method;
      let defaultMethod = settings.get_int('preferred-copy-method');
      if (defaultMethod == 0){
        method = 1;
      } else {
        method = 0;
      }

      this.onIconCopied(action, this.activeIcon.gfile, method);
    });

    actionGroup.insert(copyWithAltMethodAction);


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
	async onIconCopied(emitter, gfile, method = -1){

	  try {

	      if(method < 0){
	        method = settings.get_int('preferred-copy-method');
	      }

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


        // Open the resource for reading
        const [, fileContents] = gfile.load_contents(null);
        const stringContents = new TextDecoder().decode(fileContents);

        /* 1: Create the plain text content provider */

        // Create a GValue of type string, containing the file's contents
        const textValue = new GObject.Value();
        textValue.init(GObject.TYPE_STRING);
        textValue.set_string(stringContents);

        // Create the string content provider
        const contentProviderString = Gdk.ContentProvider.new_for_value(textValue);


        /* 2: Create the file content provider */

        // Convert any em/rem units in the file to pixels. This ensures the size is correctly set in design software. Otherwise, icons are pasted at 12px.
        const strippedEmRemUnits = stringContents.replaceAll(/1em|1rem/gi, '16px').replaceAll(/2em|2rem/gi, '32px').replaceAll(/3em|3rem/gi, '48px').replaceAll(/4em|4rem/gi, '64px');

        // Create a temporary file with the new contents
        const tempFile = Gio.File.new_for_path(GLib.build_filenamev([tempPath, gfile.get_basename()]));
        tempFile.replace_contents(strippedEmRemUnits, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);

        // Create a new GValue with the temp file as its content
        const fileValue = new GObject.Value();
        fileValue.init(Gio.File);
        fileValue.set_object(tempFile);

        // Create the file content provider
        const contentProviderFile = Gdk.ContentProvider.new_for_value(fileValue);

        // Set the appropriate content provider based on the user's chosen method
        let contentProviderUnion;
        let toastSuccessMessage;

        if(method === 0){
          // Use the file content provider ("Copy SVG file")
          contentProviderUnion = Gdk.ContentProvider.new_union([contentProviderFile]);
          toastSuccessMessage = 'SVG file copied to clipboard';

        } else if (method === 1){
          // Use the plain text content provider ("Copy SVG code")
          contentProviderUnion = Gdk.ContentProvider.new_union([contentProviderString]);
          toastSuccessMessage = 'SVG code copied to clipboard';
        }

        // Copy the icon to the clipboard
        const clipboard = this.get_clipboard();
        if(clipboard.set_content(contentProviderUnion)){
          toastTitle = toastSuccessMessage;
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


