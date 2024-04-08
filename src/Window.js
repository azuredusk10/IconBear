import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { IconSetStackView } from './IconSetStackView.js';
import { Icon } from './Icon.js';

export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///design/chris_wood/IconBear/ui/Window.ui',
	InternalChildren: ['search_entry', 'main_stack', 'sidebar_panel', 'show_details_sidebar_button', 'main_toolbar_view', 'main_header_bar'],
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
    this.#bindToSettings();
    // this.#importBundledIcons();
    this.#setupActions();
    this.#initializeIcons();
    this.#initializeMainStack();
  }

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}


	#bindToSettings(){
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
    const bundledIconsDir = '/design/chris_wood/IconBear/icon-sets/';

    const bundleDirNames = Gio.resources_enumerate_children(bundledIconsDir, 0);

    bundleDirNames.forEach(bundleDirName => {

      // Remove the trailing slash from the directory
      const bundleId = bundleDirName.slice(0, -1);

      // Establish the structure of the set object
      let set = {
        id: bundleId,
        author: '',
        name: '',
        license: '',
        icons: Gio.ListStore.new(Icon),
        iconsCount: 0,
        website: '',
      };

      // Load info.json to get the set metadata
      const metaFile = Gio.File.new_for_uri('resource://' + bundledIconsDir + bundleDirName + 'info.json');
      const metaFileBytes = metaFile.read(null).read_bytes(8192, null).get_data();
      const decoder = new TextDecoder;
      const metaFileData = decoder.decode(metaFileBytes);
      const metaJson = JSON.parse(metaFileData);

      // Populate the json data into the set object
      set.name = metaJson.name;
      set.license = metaJson.license;
      set.author = metaJson.author;
      set.website = metaJson.website;

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
      stackPageChild.setLicense = set.license;
      stackPageChild.setAuthor = set.author;
      stackPageChild.setWebsite = set.website;
      stackPageChild.notify('setId');
      stackPageChild.maxPreviewIcons = this.maxPreviewIcons;

      // Bind properties to the composite widget
      this._search_entry.bind_property('text', stackPageChild, 'searchEntryText', GObject.BindingFlags.SYNC_CREATE);
      this.bind_property('sidebarVisible', stackPageChild, 'sidebarVisible', GObject.BindingFlags.SYNC_CREATE);
      this.bind_property('iconPreviewSize', stackPageChild, 'iconPreviewSize', GObject.BindingFlags.SYNC_CREATE);

      // Add the stack page
      this._main_stack.add_titled(stackPageChild, set.name, set.name);

    });

    // Bind the visible stack page to a setting
    settings.bind('visible-page-name', this._main_stack, 'visible-child-name', Gio.SettingsBindFlags.DEFAULT)

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

	onStackPageChange(stack){
	  const visiblePageName = stack.visibleChildName;
	  if(visiblePageName === 'all_sets'){

	    // Visually hide the header bar
      this.sidebarButtonVisible = false;
      this._main_toolbar_view.topBarStyle = 0;
      this._main_toolbar_view.extendContentToTopEdge = true;
      this._main_header_bar.showTitle = false;

      // TODO: Make this translateable
      this.searchPlaceholderText = 'Search sets';

	  } else {

	    // Show the header bar
	    this.sidebarButtonVisible = true;
	    this._main_toolbar_view.topBarStyle = 1;
	    this._main_toolbar_view.extendContentToTopEdge = false;
	    this._main_header_bar.showTitle = true;

	    this.searchPlaceholderText = 'Search icons in this set';

	    const visiblePage = stack.get_visible_child();
	    visiblePage.loadAllIcons();
	  }

	}

	onSetActivated(_flowbox, setName){
	  this._main_stack.set_visible_child_name(setName);
	}

});


