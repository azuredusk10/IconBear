import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { IconSetStackView } from './IconSetStackView.js';
import { Icon } from './Icon.js';

// Set up async file methods
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');


export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///design/chris_wood/IconBear/ui/Window.ui',
	InternalChildren: ['search_entry', 'main_stack', 'sidebar_panel', 'show_details_sidebar_button', 'main_toolbar_view', 'main_header_bar', 'add_set_dialog_widget', 'all_sets_view'],
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
    this.#initializeWindow();

    this._all_sets_view.connect('set-added', async (emittingObject, folderName) => {
      const setName = await this.#loadSet(folderName);
      this.#createSetStackPage(setName);
    });

     this._add_set_dialog_widget.connect('set-added', async (emittingObject, folderName) => {
      const setName = await this.#loadSet(folderName);
      this.#createSetStackPage(setName);
    });
  }

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}

	async #initializeWindow(){
	  try {
	    this.#bindToSettings();
      this.#initializeActions();
      await this.#initializeIcons();
      this.#initializeMainStack();
    } catch(e) {
      console.log('Could not initialize window: ' + e);
    }
	}


	#bindToSettings(){
	  settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
	  settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}

	#initializeActions(){
    // Add icons
    const openAction = new Gio.SimpleAction({name: 'add_set'});
    openAction.connect('activate', () => this.#importSet());
    this.add_action(openAction);

  }


	async #initializeIcons() {

	  this.sets = [];

    // loop through the app's data directory to find and initialize icon sets
    try {
      const dataDir = GLib.get_user_data_dir();
      const dataDirFile = Gio.File.new_for_path(dataDir);
      const dataIter = await dataDirFile.enumerate_children_async('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);

      // Check each folder for a meta.json file
      for await (const info of dataIter) {

        const fileType = info.get_file_type();
        const folderName = info.get_name();

        if (fileType === Gio.FileType.DIRECTORY) {

            await this.#loadSet(folderName);

        }
      }
    } catch(e) {
      console.log('Error loading sets: ' + e);
      return false;
    }
    this.notify('sets');
  }

  /**
  * Locate a set's folder in the user's data directory. Then, process its metadata, load its icons, and store all this in the "sets" property
  * @param {string} folderName - the name of the folder to look for in the user's data directory
  * @return {string} setName - the name of the set, as defined in its meta.json file
  **/
  async #loadSet(folderName){
    console.log('running #loadset for folderName: ' + folderName);

    const dataDir = GLib.get_user_data_dir();
    const folderPath = GLib.build_filenamev([dataDir, folderName]);
    const metaFile = Gio.File.new_for_path(GLib.build_filenamev([folderPath, 'meta.json']));

    if (metaFile.query_exists(null)) {
        print(`Found "meta.json" file in ${folderPath}`);

        // Remove the trailing slash from the directory
        const setId = folderPath.slice(0, -1);

        // Establish the structure of the set object
        let set = {
          id: setId,
          author: '',
          name: '',
          license: '',
          icons: Gio.ListStore.new(Icon),
          iconsCount: 0,
          website: '',
        };

        // Load meta.json to get the set metadata
        const metaFileSize = metaFile.query_info('standard::size', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null).get_size();
        const metaFileBytes = metaFile.read(null).read_bytes(metaFileSize, null).get_data();
        const decoder = new TextDecoder;
        const metaFileData = decoder.decode(metaFileBytes);
        const metaJson = JSON.parse(metaFileData);

        // Populate the json data into the set object
        set.name = metaJson.name;
        set.license = metaJson.license;
        set.author = metaJson.author;
        set.website = metaJson.website;

        // Get an array of all the files in this bundle resource directory
        const iconsDir = folderPath + '/icons/';
        const iconFilenames = await Gio.File.new_for_path(iconsDir).enumerate_children_async('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);

        set.iconsCount = metaJson.icons.length;

        let i = 0;
        const iconsArray = [];

        metaJson.icons.forEach(icon => {

          const iconFilename = icon.fileName;

          // TODO: When specified by a parameter, only load the number of icons needed to populate the set preview tile for the "All sets" view
          // Loads all icons in the set


          if(i < set.iconsCount){

            // Create the Gio.File for this icon and get its file info
            const iconFile = Gio.File.new_for_path(iconsDir + iconFilename);
            const fileInfo = iconFile.query_info('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

            const label = iconFilename.replace(/\.[^/.]+$/, "");

            // Create a new Icon
            const newIcon = new Icon({
              label,
              filepath: iconsDir + iconFilename,
              type: fileInfo.get_file_type(),
              gfile: iconFile,
              width: icon.width,
              height: icon.height,
              style: icon.style,
            });

            iconsArray.push(newIcon);

            // console.log(newIcon.label);
          }

          i++;

        });

        // Add the loaded icons into the list store
        set.icons.splice(0, 0, iconsArray);

        this.sets.push(set);

        this.notify('sets');


        return set.name;

    } else {
        print(`"meta.json" file not found in ${folderPath}`);
    }
  }

  #initializeMainStack(){
    // Link the StackPageSidebar in the sidear_panel to the main_stack StackPage
    this._sidebar_panel._main_stack_sidebar.stack = this._main_stack;

    // Create a new StackPage for each set
    this.sets.forEach(set => {

      this.#createSetStackPage(set.name);

    });

    // Bind the visible stack page to a setting
    settings.bind('visible-page-name', this._main_stack, 'visible-child-name', Gio.SettingsBindFlags.DEFAULT)

  }

  /**
  * Add a new IconSetStackView to the main_stack GtkStack
  * @params {string} setName - the name of the icon set that the new StackPage will display. Used to look up the corresponding set in the "set" property.
  **/
  #createSetStackPage(setName){

    const set = this.sets.find((object) => {
      return object.name === setName;
    });

    // Create a copy of the preview icon set list store to pass into the IconSetStackView

      // Doesn't seem necessary any more
      /*
      const copiedIconsListStore = new Gio.ListStore();

      const sourceIconsListStoreCount = set.icons.n_items;
      console.log(sourceIconsListStoreCount);

      let i=0;
      while (i < sourceIconsListStoreCount) {
        const icon = set.icons.get_item(i);
        copiedIconsListStore.append(icon);

        i++;
      }
      */

      console.log('icons in set: ' + set.icons.n_items);

      // Create the composite widget child of the StackPage
      const stackPageChild = new IconSetStackView({
        icons: set.icons,
      });

      stackPageChild.setName = set.name;
      stackPageChild.iconsCount = set.iconsCount;
      stackPageChild.setId = set.id;
      stackPageChild.setLicense = set.license || '';
      stackPageChild.setAuthor = set.author || '';
      stackPageChild.setWebsite = set.website || '';
      stackPageChild.notify('setId');
      stackPageChild.maxPreviewIcons = this.maxPreviewIcons;

      // Bind properties to the composite widget
      this._search_entry.bind_property('text', stackPageChild, 'searchEntryText', GObject.BindingFlags.SYNC_CREATE);
      this.bind_property('sidebarVisible', stackPageChild, 'sidebarVisible', GObject.BindingFlags.SYNC_CREATE);
      this.bind_property('iconPreviewSize', stackPageChild, 'iconPreviewSize', GObject.BindingFlags.SYNC_CREATE);

      // Add the stack page
      this._main_stack.add_titled(stackPageChild, set.name, set.name);
  }

  #importSet(folder = null) {

    if(folder){
      this._add_set_dialog_widget.folder = folder;
      return;
    }

    // Only accept svg files
    //const fileFilter = Gtk.FileFilter.new();
    //fileFilter.add_mime_type('image/svg+xml');

    // Create a new file selection dialog
    // const fileDialog = new Gtk.FileDialog({ default_filter: fileFilter });
    const fileDialog = new Gtk.FileDialog();

   // Open the dialog and handle user's selection
   fileDialog.select_folder(this, null, async (self, result) => {
      try {
         const folder = self.select_folder_finish(result);

         if (folder) {
               //console.log(this.getFileName(folder));

               // Pass the GFile object containing the folder to the AddSetDialog widget, which will trigger it to open and process the folder via its setter function
               this._add_set_dialog_widget.prepareImport(folder);

         }
      } catch(_) {
         // user closed the dialog without selecting any file
      }
   });
  }

  getFileName(file) {
    const info = file.query_info(
      "standard::name",
      Gio.FileQueryInfoFlags.NONE,
      null,
    );
    return info.get_name();
  }

	onSearchEntrySearchChanged() {
	  const searchEntryText = this._search_entry.text;
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
	    //visiblePage.loadAllIcons();
	  }

	}

	onSetActivated(_flowbox, setName){
	  this._main_stack.set_visible_child_name(setName);
	}

	onDrop(_target, value, _x, _y) {
    console.log(`Dropped file: '${value}'`);

    const info = value.query_info('standard::type', Gio.FileQueryInfoFlags.NONE, null);
    const fileType = info.get_file_type();

    console.log(fileType);

    if (fileType === Gio.FileType.DIRECTORY) {
        // Handle dropped directory
        this.#importSet(value);
    } else {
        // Ignore non-directory files
        print('This is not a directory. Ignoring.');
    }

    return true;
  }

});


