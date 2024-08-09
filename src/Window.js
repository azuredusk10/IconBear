import { gettext as _ } from "gettext";
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { PreferencesDialog } from './PreferencesDialog.js';

import { IconSetStackView } from './IconSetStackView.js';
import { Icon } from './Icon.js';
import { deleteRecursively } from './helperFunctions.js'

// Set up async file methods
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');
Gio._promisify(Gio.File.prototype, 'delete_async');


export const Window = GObject.registerClass({
	GTypeName: 'IcoWindow',
	Template: 'resource:///design/chris_wood/IconBear/ui/Window.ui',
	InternalChildren: ['search_entry', 'main_stack', 'sidebar_panel', 'show_details_sidebar_button', 'main_toolbar_view', 'main_header_bar', 'add_set_dialog_widget', 'all_sets_view', 'search_controls_wrapper', 'import_button', 'radio_all_styles', 'radio_outline','radio_filled','radio_duotone','radio_color', 'filters_button', 'primary_popover_menu'],
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
    styleFilter: GObject.ParamSpec.int(
      'styleFilter',
      'Style filter',
      'The icon style to filter the set by',
      GObject.ParamFlags.READWRITE,
      0, 4,
      0
    ),
    maxPreviewIcons: GObject.ParamSpec.int(
      'maxPreviewIcons',
      'Max Preview Icons',
      'The maximum number of items to show when previewing a set',
      GObject.ParamFlags.READWRITE,
      0, 100,
      12
    ),
    iconPreviewScale: GObject.ParamSpec.double(
      'iconPreviewScale',
      'Icon Preview Scale',
      'The scale to render icon previews at',
      GObject.ParamFlags.READWRITE,
      0, 20,
      2
    ),
	}
}, class extends Adw.ApplicationWindow {
  constructor(params={}){
    super(params);
    this.#initializeWindow();
    this.#initializePopoverMenu();

    this._all_sets_view.connect('set-added', async (emittingObject, folderName) => {
      try {
        const setName = await this.#loadSet(folderName);
        this.#createSetStackPage(setName);
        this._all_sets_view.loadView();
      } catch(e) {
        console.log('Error handling set-added signal: ' + e);
      }
    });

     this._add_set_dialog_widget.connect('set-added', async (emittingObject, folderName) => {
      try {
        const setName = await this.#loadSet(folderName);
        this.#createSetStackPage(setName);
        this._all_sets_view.loadView();
      } catch(e){
        console.log('Error handling set-added signal: ' + e);
      }
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
	  settings.bind('icon-preview-scale', this, 'iconPreviewScale', Gio.SettingsBindFlags.DEFAULT);
	}

	#initializeActions(){
    // Add icons
    const openAction = new Gio.SimpleAction({name: 'add_set'});
    // openAction.connect('activate', () => this.#importSet());
    openAction.connect('activate', () => this.openImportDialog());
    this.add_action(openAction);

    // Delete an icon set
    const deleteSetAction = new Gio.SimpleAction({
      name: 'delete_set',
      parameterType: new GLib.VariantType('s')
    });
    deleteSetAction.connect('activate', (action, parameter) => this.#deleteSet(parameter));
    this.add_action(deleteSetAction);

    // Change the 'style' filter
    const filterByStyleAction = new Gio.SimpleAction({
      name: 'filter_by_style',
      parameterType: new GLib.VariantType('i')
    });
    filterByStyleAction.connect('activate', (action, parameter) => this.filterByStyle(parameter));
    this.add_action(filterByStyleAction);

    // Open to a specific StackPage
    const openStackPageAction = new Gio.SimpleAction({
      name: 'open_stack_page',
      parameterType: new GLib.VariantType('s')
    });
    openStackPageAction.connect('activate', (action, parameter) => this.openStackPage(parameter));
    this.add_action(openStackPageAction);

    // Clear search term and reset style filter
     const clearFiltersAction = new Gio.SimpleAction({
      name: 'clear_filters'
    });
    clearFiltersAction.connect('activate', (action) => {
      this._search_entry.text = '';
      this.filterByStyle(GLib.Variant.new_int16(0));
    });
    this.add_action(clearFiltersAction);

    // Open the "About" dialog
    const openAboutDialog = new Gio.SimpleAction({
      name: 'open_about_dialog'
    });
    openAboutDialog.connect('activate', (action) => this.openAboutDialog());
    this.add_action(openAboutDialog);

    // Open the "Preferences" dialog
    const openPreferencesDialog = new Gio.SimpleAction({
      name: 'open_preferences_dialog'
    });
    openPreferencesDialog.connect('activate', (action) => this.openPreferencesDialog());
    this.add_action(openPreferencesDialog);

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

      // Then load the "My sets" view
      this._all_sets_view.loadView();

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

        // Establish the structure of the set object
        let set = {
          id: folderName,
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

    // Remove the skeleton state
    this._skeleton_stack_page.destroy();

    // Set the header bar for the current stack view
    this.onStackPageChange(this._main_stack);

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
      this.bind_property('iconPreviewScale', stackPageChild, 'iconPreviewScale', GObject.BindingFlags.SYNC_CREATE);
      this.bind_property('styleFilter', stackPageChild, 'styleFilter', GObject.BindingFlags.SYNC_CREATE);

      // Add the stack page
      this._main_stack.add_titled(stackPageChild, set.name, set.name);
  }

  openImportDialog(){
    this._add_set_dialog_widget.openDialog(this);
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

	    // Show the header items relevant for the My Sets view
      this.sidebarButtonVisible = false;
      this._main_toolbar_view.topBarStyle = 0;
      this._search_controls_wrapper.visible = false;
      this._import_button.visible = true;

      // this.searchPlaceholderText = 'Search sets';

	  } else {

	    // Show the header items relevant for the single set view
	    this.sidebarButtonVisible = true;
	    this._main_toolbar_view.topBarStyle = 1;
	    this._search_controls_wrapper.visible = true;
	    this._import_button.visible = false;

	    this.searchPlaceholderText = 'Search icons in this set';
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

  /**
  * Deletes a set folder from the user's data directory and removes it from the application
  * @param {GLib.Variant} gVariantSetId - the name of the set to be deleted, stored in a GLib.Variant of type string
  **/
  async #deleteSet(gVariantSetId){
    // Note: removing the console.log lines causes the app to crash whenever this method is run.
    try {
      const setId = gVariantSetId.get_string()[0];
      console.log('deleting ' + setId);

      // Show the "Processing" state in the All Sets view
      this._all_sets_view.showProcessingState();

      // Remove this set from this.sets
      this.sets.filter(set => set.id === setId)

      let i=0;
      this.sets.forEach(set => {
        if (set.id === setId){
           this.sets.splice(i, 1);
           this.#removeSetStackPage(set.name);
        }
        i++;
      })

      // Remove the meta file first, so the app no longer recognises it as a set
      const dataDir = GLib.get_user_data_dir();
      const folderPath = GLib.build_filenamev([dataDir, setId]);
      const metaFile = Gio.File.new_for_path(GLib.build_filenamev([folderPath, 'meta.json']));
      console.log('deleting meta file');
      await metaFile.delete_async(GLib.PRIORITY_DEFAULT, null);

      // Reload the "All sets" view
      this._all_sets_view.loadView();

      // Remove all other files and subdirectories, as well as the set folder itself
      console.log('deleting remaining files and folders');
      await deleteRecursively(folderPath, true);

      // Hide the "Processing" state in the All Sets view
      this._all_sets_view.hideProcessingState();

    } catch(e) {
      console.log('Error deleting set: ' + e);
    }
  }

  /**
  * Remove an IconSetStackView from the main_stack GtkStack
  * @params {string} pageName - the name of the stack page to remove
  **/
  #removeSetStackPage(pageName){

    const stack = this._main_stack;

    const pageToRemove = stack.get_child_by_name(pageName);
    stack.remove(pageToRemove);
  }

  /** Change the icon style filter
  * @param {Number} style - the style ID to filter for. 0 = all styles. 1 = outline; 2 = filled; 3 = duotone; 4 = color.
  **/
  filterByStyle(style){
    // Set the new style filter and notify MainPanelView about the change
    const styleId = style.unpack();

    // If there's no change, then return
    if(styleId === this.styleFilter) return;

    this.styleFilter = styleId;
    this.notify('styleFilter');

    // Update the filter to show which item has been selected
    this._radio_all_styles.active = false;
    this._radio_outline.active = false;
    this._radio_filled.active = false;
    this._radio_duotone.active = false;
    this._radio_color.active = false;

    switch(styleId){
      case 0:
        this._radio_all_styles.active = true;
        this.setFilterButtonState(false);
        break;
      case 1:
        this._radio_outline.active = true;
        this.setFilterButtonState(true);
        break;
      case 2:
        this._radio_filled.active = true;
        this.setFilterButtonState(true);
        break;
      case 3:
        this._radio_duotone.active = true;
        this.setFilterButtonState(true);
        break;
      case 4:
        this._radio_color.active = true;
        this.setFilterButtonState(true);
        break;
    }
  }

  /** Change the visual state of the filters popover button
  * @param {Boolean} isActive - whether a filter is currently active or not
  **/
  setFilterButtonState(isActive){
    if(isActive){
      this._filters_button.iconName = 'ico-funnel-symbolic';
      this._filters_button.add_css_class('opaque');
    } else {
      this._filters_button.iconName = 'ico-funnel-outline-symbolic';
      this._filters_button.remove_css_class('opaque');
    }

  }

  /** Navigate to a particular StackPage
  * @param {String} stackPageName
  **/
  openStackPage(stackPageName) {
    const pageToOpen = this._main_stack.get_child_by_name(stackPageName);
    this._main_stack.set_visible_child(pageToOpen);
  }

  /**
  * Adds custom widgets to the window's popover menu
  **/
  #initializePopoverMenu() {
    const previewSizeWidget = new Gtk.Box({
      orientation: 'horizontal',
      hexpand: true,
      halign: 0,
    });

    const spinButton = new Gtk.SpinButton({
      halign: 2,
      hexpand: true,
      widthChars: 5,
    });
    const defaultAdjustmentValue = this.iconPreviewScale * 100;
    const spinAdjustment = Gtk.Adjustment.new(defaultAdjustmentValue, 50, 2000, 25, 25, 0);
    spinButton.adjustment = spinAdjustment;

    // Always append a % sign to the end of the value
    spinButton.connect('output', () => {
      const newValue = spinButton.get_value();
      spinButton.set_text(`${newValue}%`);

      return true;
    });

    spinButton.connect('value-changed', () => this.iconPreviewScale = spinButton.get_value() / 100);

    const label = new Gtk.Label({
      label: 'Zoom',
      halign: 1,
      valign: 3,
      marginStart: 12
    })

    previewSizeWidget.append(label);
    previewSizeWidget.append(spinButton);

    this. _primary_popover_menu.add_child(previewSizeWidget, 'preview_size_widget');
  }

  openAboutDialog() {
    const dialog = new Adw.AboutDialog({
      application_icon: "application-x-executable",
      application_name: "Icon Bear",
      developer_name: "Chris Wood",
      version: "0.1.0",
      website: "https://www.chris-wood.design/icon-bear-app",
      issue_url: "https://github.com/azuredusk10/IconBear/issues",
      copyright: "© 2024 Chris Wood",
      license_type: Gtk.License.GPL_3_0_ONLY,
      translator_credits: _("translator-credits"),
    });

    dialog.add_legal_section(
      _("Icons"),
      null,
      Gtk.License.CUSTOM,
      _(
        "This application uses icons from <a href='https://example.org'>somewhere</a>.",
      ),
    );

    dialog.add_acknowledgement_section(_("Special thanks to"), [_("My cat")]);

    dialog.present(this);
  }

  openPreferencesDialog(){
    const preferencesDialog = new Adw.Dialog({ title: 'Settings' });
    const dialogChild = new PreferencesDialog;

    preferencesDialog.set_child(dialogChild);
    preferencesDialog.present(this);
  }

});


