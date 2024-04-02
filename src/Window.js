import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { IconSetStackView } from './IconSetStackView.js';
import { Icon } from './Icon.js';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///com/github/azuredusk10/IconManager/ui/Window.ui',
	InternalChildren: ['search_entry', 'main_stack', 'sidebar_panel', 'show_details_sidebar_button'],
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
    maxPreviewIcons: GObject.ParamSpec.int(
      'maxPreviewIcons',
      'Max Preview Icons',
      'The maximum number of items to show when previewing a set',
      GObject.ParamFlags.READWRITE,
      0, 100,
      12
    ),
    iconPreviewSize: GObject.ParamSpec.int(
      'iconPreviewSize',
      'Icon Preview Size',
      'The size to render icon previews at',
      GObject.ParamFlags.READWRITE,
      0, 1024,
      24
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

      // Remove the trailing slash from the directory
      const bundleId = bundleDirName.slice(0, -1);

      // Establish the structure of the set object
      let set = {
        id: bundleId,
        name: bundleId, // TODO: get from info.json
        licence: '', // TODO: get from info.json
        icons: Gio.ListStore.new(Icon),
        iconsCount: 0
      };

      // Get an array of all the files in this bundle resource directory
      const iconsDir = bundledIconsDir + bundleDirName + 'icons/';
      const iconFilenames = Gio.resources_enumerate_children(iconsDir, 0);

      set.iconsCount = iconFilenames.length;

      // Sort the icons in alphabetical order
      iconFilenames.sort();

      let i = 0;
      const iconsArray = [];

      iconFilenames.forEach(iconFilename => {

        // Only load the number of icons needed to populate the set preview tile for the "All sets" view
        if(i < this.maxPreviewIcons){

          // Create the Gio.File for this icon resource and get its file info
          const iconFile = Gio.File.new_for_uri('resource://' + iconsDir + iconFilename);
          console.log(iconsDir + iconFilename);
          const fileInfo = iconFile.query_info('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

          const label = iconFilename.replace(/\.[^/.]+$/, "");

          // Create a new Icon
          const icon = new Icon({
            label,
            filepath: iconsDir + iconFilename,
            type: fileInfo.get_file_type(),
            gfile: iconFile,
          });

	        // TODO: Using the list store's splice method to add all icons at once would be more efficient.
          iconsArray.push(icon);
        }

        i++;

      });

      // Add the loaded icons into the list store
      set.icons.splice(0, 0, iconsArray);


      this.sets.push(set);

    });

    this.notify('sets');
  }

  #initializeMainStack(){
    // Link the StackPageSidebar in the sidear_panel to the main_stack StackPage
    this._sidebar_panel._main_stack_sidebar.stack = this._main_stack;

    // Create a new StackPage for each set
    this.sets.forEach(set => {

      // Create a copy of the preview icon set list store to pass into the IconSetStackView
      const copiedIconsListStore = new Gio.ListStore();

      const sourceIconsListStoreCount = set.icons.n_items;
      console.log(sourceIconsListStoreCount);

      let i=0;
      while (i < sourceIconsListStoreCount) {
        const icon = set.icons.get_item(i);
        copiedIconsListStore.append(icon);

        i++;
      }

      // Create the composite widget child of the StackPage
      const stackPageChild = new IconSetStackView({
        icons: copiedIconsListStore,
      });

      stackPageChild.setName = set.name;
      stackPageChild.iconsCount = set.iconsCount;
      stackPageChild.setId = set.id;
      stackPageChild.notify('setId');
      stackPageChild.maxPreviewIcons = this.maxPreviewIcons;

      // Bind properties to the composite widget
      stackPageChild.bind_property('searchEntryText', this._search_entry, 'text', GObject.BindingFlags.SYNC_CREATE);
      stackPageChild.bind_property('sidebarVisible', this, 'sidebarVisible', GObject.BindingFlags.SYNC_CREATE);
      stackPageChild.bind_property('iconPreviewSize', this, 'iconPreviewSize', GObject.BindingFlags.SYNC_CREATE);


      this._main_stack.add_titled(stackPageChild, set.id, set.name);

    });

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

	    const visiblePage = e.get_visible_child();
	    visiblePage.loadAllIcons();

	  }
	}

	onSetActivated(_flowbox, setName){
	  this._main_stack.set_visible_child_name(setName);
	}

});


