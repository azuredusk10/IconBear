import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///com/github/azuredusk10/IconManager/ui/Window.ui',
	InternalChildren: ['search_entry', 'set_view', 'main_stack', 'sidebar_panel', 'show_details_sidebar_button'],
	Properties: {
	  sets: GObject.ParamSpec.jsobject(
      'sets',
      'Sets',
      'All icon sets',
      GObject.ParamFlags.READWRITE
	  ),
	  currentSetIcons: GObject.ParamSpec.object(
      'currentSetIcons',
      'Current Set Icons',
      'The list model containing the icons in the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
    currentSetName: GObject.ParamSpec.string(
      'currentSetName',
      'Current Set Name',
      'The name of the currently selected icon set',
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
    iconSize: GObject.ParamSpec.double(
      'iconSize',
      'Icon Size',
      'The size to render icons in the grid at',
      GObject.ParamFlags.READWRITE,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
      24
    ),
    sidebarButtonVisible: GObject.ParamSpec.boolean(
      'sidebarButtonVisible',
      'Sidebar Button Visible',
      'Whether the details sidebar toggle button is visible or not',
      GObject.ParamFlags.READWRITE,
      false,
    ),
    searchPlaceholderText: GObject.ParamSpec.string(
      'searchPlaceholderText',
      'Search Placeholder Text',
      'The placeholder text to display in the search entry',
      GObject.ParamFlags.READWRITE,
      'Search sets'
    ),
	}
}, class extends Adw.ApplicationWindow {
  constructor(params={}){
    super(params);
    this.#bindSizeToSettings();
    // this.#importBundledIcons();
    this.#setupActions();
    this.#initializeIcons();
    this.#initializeMainStack();
  }

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}


	#bindSizeToSettings(){
	  settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
	  settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}

	#setupActions(){

  }


	#initializeIcons() {

	  this.sets = [];

    // loop through icon-sets resource directory
    // Icons: icon-sets/[bundle-name]/icons/*.svg
    // Info: icon-sets/[bundle-name]/info.json
    const bundledIconsDir = '/com/github/azuredusk10/IconManager/icon-sets/';

    const bundleDirNames = Gio.resources_enumerate_children(bundledIconsDir, 0);

    bundleDirNames.forEach(bundleDirName => {
      const bundleId = bundleDirName.slice(0, -1);

      let set = {
        id: bundleId,
        name: '', // To get from info.json
        licence: '', // To get from info.json
        icons: Gio.ListStore.new(Icon),
      };

      const iconsDir = bundledIconsDir + bundleDirName + 'icons/';
      const iconFilenames = Gio.resources_enumerate_children(iconsDir, 0);

      console.log(iconsDir);



      //const iconFiles = Gio.File.new_for_uri(iconsDir).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

      // let fileInfo;
	    // let i=0;
	    // while (fileInfo = iconFiles.next_file(null)) {
	      //if(i < 50){
      iconFilenames.forEach(iconFilename => {


        const iconFile = Gio.File.new_for_uri(iconsDir + iconFilename);
        console.log(iconsDir + iconFilename);
        const fileInfo = iconFile.query_info('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

        const label = fileInfo.get_display_name().replace(/\.[^/.]+$/, "");

        const icon = new Icon({
          label,
          filepath: iconsDir + iconFilename,
          type: fileInfo.get_file_type(),
          gfile: iconFile,
        });


	      // TODO: Using the list store's splice method to add all icons at once would be more efficient.
        this.set.icons.append(icon);

      /*
      label: GObject.ParamSpec.string('label', 'Label', 'Name of the icon', GObject.ParamFlags.READWRITE, ''),
  filepath: GObject.ParamSpec.string('filepath', 'Filepath', 'Path to the icon file', GObject.ParamFlags.READWRITE, ''),
  // icon: GObject.ParamSpec.object('icon', 'Icon', 'Icon for the file', GObject.ParamFlags.READWRITE, Gio.Icon),
  type: GObject.ParamSpec.enum('type', 'Type', 'File type', GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
  gFile: GObject.ParamSpec.object('gfile', 'GFile', 'GFile of the icon', GObject.ParamFlags.READWRITE, Gio.File)
      */

        // }
      // }

      });


      this.sets.push(set);
    });

    console.log(this.sets);
    this.notify('sets');



    // add a new item in the ‘sets’ array with the name of the set and the first 16 icons

    // create a new Stack Page for each set. Pass the set into it.

    // When switching to a new Stack Page, check how many items are in that page’s set. If it’s equal to or less than 16, ask Window.js to load the full set.


    this.currentSetIcons = Gio.ListStore.new(Icon);

    const iconSetsDir = GLib.build_pathv('/', [GLib.get_home_dir(), '/icon-sets']);
    console.log(iconSetsDir);

    const carbonSetDir = GLib.build_pathv('/', [iconSetsDir, '/carbon']);
    console.log(carbonSetDir);

  		// Get an enumerator of all children
    	const children = Gio.File.new_for_path(carbonSetDir).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);


		let fileInfo;
		let i=0;
		while (fileInfo = children.next_file(null)) {
		  if(i < 50){
		    const label = fileInfo.get_display_name().replace(/\.[^/.]+$/, "");

		      const icon = new Icon({
		        label,
		        filepath: carbonSetDir + '/' + fileInfo.get_name(),
		        type: fileInfo.get_file_type(),
		        gfile: children.get_child(fileInfo),
		      });

		      // TODO: Using the list store's splice method to add all icons at once would be more efficient.
		      this.currentSetIcons.append(icon);

		      // console.log('adding "' + label + '" to list store');

		      i++;
	    }
		}

		// This will tell the Main Panel that the icons have been fully processed
		this.notify('currentSetIcons');

  }

  #initializeMainStack(){
    this._sidebar_panel._main_stack_sidebar.stack = this._main_stack;
  }

  #importBundledIcons() {
    /*
    // If the user is opening the app for the first time, import the bundled icons to their app data directory
    const dataDir = GLib.get_user_data_dir();
    console.log(dataDir);

    const bundledIconsDir = '/com/github/azuredusk10/IconManager/icon-sets/';

    // Detect whether the user data directory has all the bundled icons

    // Create an array of bundle names
    const bundleNamesArray = Gio.resources_enumerate_children(bundledIconsDir, 0);
    console.log(bundleNamesArray);


    bundleNamesArray.forEach(bundleName => {
      // Check if a folder exists with that bundle name
      const bundleDataPath = dataDir + '/' + bundleName;
      console.log(bundleName);

      const bundleDataDir = Gio.File.new_for_path(bundleDataPath);

      const dirExists = bundleDataDir.query_file_type(0, null);
      switch(dirExists){
        case 0:
          console.log('Dir does not exist');
          break;
        case 2:
          console.log('Dir exists');
          return;
        default:
          console.log('A file with this name exists')
          return;
      }

      // If the data directory doesn't already exist, make it
      console.log(bundleDataDir.make_directory(null));

      // Try just copying all files from the relevant resource directory to the data directory?
      // Or do I even need to bother with this if I'm going to keep the built-in icons as resources anyway? Arg probably not.

      // Create a File object representing the bundle directory
      const bundlePath = 'resource://com/github/azuredusk10/IconManager/icon-sets/' + bundleName +'/icons'
      const bundleDirFile = Gio.File.new_for_uri(bundlePath);


      // Iterate through the bundle directory and copy each file to the data directory
      const iconFilenamesArray = Gio.resources_enumerate_children(bundledIconsDir + 'carbon', 0);
      console.log(iconFilenamesArray);
      iconFilenamesArray.forEach(iconFilename => {
        const sourceFile = Gio.File.new_for_uri(bundlePath + '/' + iconFilename);
        const targetFile = Gio.File.new_for_path(bundleDataPath + iconFilename);

        sourceFile.copy(targetFile, 1, null, null);
      });







    });

    */


  }

	onSearchEntrySearchChanged() {
	  const searchEntryText = this._search_entry.text;
    // TODO: Set searchEntryText property of the active stack page
    // this._main_panel.searchEntryText = this._search_entry.text;
	}

	onIconSizeChanged(_scale){

	  this.iconSize = _scale.get_value();

	  console.log(this.iconSize);
	  // this.notify('iconSize');
	}

	onDetailsSidebarToggled(){
	  this.sidebarVisible = !this.sidebarVisible;
	  this.notify('sidebarVisible');
	}

	onStackPageChange(e){
	  const visiblePageName = e.visibleChildName;
	  if(visiblePageName === 'all_sets'){
      this.sidebarButtonVisible = false;
      // TODO: Make this translateable
      this.searchPlaceholderText = 'Search sets';
	  } else {
	    this.sidebarButtonVisible = true;
	    this.searchPlaceholderText = 'Search icons in this set';
	  }
	}

	onSetActivated(_flowbox, setName){
	  this._main_stack.set_visible_child_name(setName);
	}

});

