import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

// import { Icon, Set } from './classes.js';
import { Set } from './classes.js';
import { Icon } from './Icon.js';
import { estimateIconStyle, drawSvg } from './helperFunctions.js';

// Set up async file methods
Gio._promisify(Gio.File.prototype, 'create_async');
Gio._promisify(Gio.File.prototype, 'copy_async');

export const AllSetsStackView = GObject.registerClass({
  GTypeName: 'IcoAllSetsStackView',
  Template: 'resource:///design/chris_wood/IconBear/ui/AllSetsStackView.ui',
  InternalChildren: ['default_sets_flowbox', 'installed_sets_flowbox', 'installed_sets_empty_state'],
  Properties: {
    searchEntryText: GObject.ParamSpec.string(
      'searchEntryText',
      'Search Entry Text',
      'The user-inputted value of the search entry',
      GObject.ParamFlags.READWRITE,
      ''
    ),
	  installedSets: GObject.ParamSpec.jsobject(
      'installedSets',
      'Installed Sets',
      'Icon sets that have been installed by the user',
      GObject.ParamFlags.READWRITE
	  ),
	  defaultSets: GObject.ParamSpec.jsobject(
      'defaultSets',
      'Default Sets',
      'Icon sets that come bundled with the app',
      GObject.ParamFlags.READWRITE
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
  },
  Signals: {
    'set-activated': {
      param_types: [GObject.TYPE_STRING]
    },
    'set-added': {
      param_types: [GObject.TYPE_STRING]
    }
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }

  /**
  * Renders the flowboxes on the page. Called by Window.js once all sets have been loaded.
  **/
  loadView(){
    this.#initializeInstalledSetsFlowbox();
    this.#initializeDefaultSets();
  }

  // Create a new child of the set preview FlowBox
  _addPreviewItem(icon, size){

    const svgWidget = new Gtk.DrawingArea({
      widthRequest: size,
      heightRequest: size,
      marginTop: 8,
      marginBottom: 8,
      cssClasses: ['icon-grid__image'],
    })

    svgWidget.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, icon.gfile));

    return svgWidget;

  }

  #initializeInstalledSetsFlowbox(){
    this._installed_sets_empty_state.visible = false;

    // Clear the contents of the Flowbox
    this._installed_sets_flowbox.remove_all();

    // Bind the model
    /*
    const newModel = Gio.ListStore.new(Set);

    const testSet = new Set();

    testSet.name = 'hello';
    testSet.author = 'author',
    testSet.icons = this.installedSets[0].icons,
    testSet.id = 'hello-id';
    testSet.iconsCount = 1000;

    newModel.append(testSet)

    // How to iterate over a ListStore:
    const newModelLength = newModel.get_n_items();
    let i = 0;
    while (i < newModelLength){
      console.log(newModel.get_item(i).name);
      i++;
    }

    this._installed_sets_flowbox.bind_model(newModel, (set) => {

      // FlowBoxChild -> Box -> (FlowBox -> FlowBoxChild -> DrawingArea * 6), (Box -> (Box -> (Label, Label), Button))

      const setTile = new Gtk.Box({
        orientation: 1,
        hexpand: true,
      });

      const setTilePreviewFlowBox = new Gtk.FlowBox({
        sensitive: false,
        minChildrenPerLine: 3,
        maxChildrenPerLine: 6,
      });

      const previewModel = Gio.ListStore.new(Icon);

      for (let i = 0; i < this.maxPreviewIcons && i < set.icons.get_n_items(); i++) {
        const icon = set.icons.get_item(i);
        previewModel.append(icon);
      }

      setTilePreviewFlowBox.bind_model(previewModel, (icon) => this._addPreviewItem(icon, this.iconPreviewSize));


      const setLabel = new Gtk.Label({
        label: set.name,
        cssClasses: ['title-3'],
        hexpand: true,
        halign: 1,
      });

      const setIconCount = new Gtk.Label({
        label: set.iconsCount.toString(),
        opacity: 0.7,
        halign: 1,
      });

      const setTileTextBox = new Gtk.Box({
        spacing: 2,
        orientation: 1,
      });

      const setTileInfoRowBox = new Gtk.Box({
        spacing: 8,
        hexpand: true,
        cssClasses: ['m-2'],
      });

      const setTileButton = new Gtk.Button({
        iconName: "view-more-symbolic",
        halign: 2,
        valign: 3,
      });

      setTileTextBox.append(setLabel);
      setTileTextBox.append(setIconCount);

      setTileInfoRowBox.append(setTileTextBox);
      setTileInfoRowBox.append(setTileButton);

      setTile.append(setTilePreviewFlowBox);
      setTile.append(setTileInfoRowBox);

      const setFlowBoxChild = new Gtk.FlowBoxChild({
        child: setTile,
        name: set.name,
        cssClasses: ['card', 'activatable'],
      });

      return setFlowBoxChild;

    });
    */

    this.installedSets.forEach(set => {

      // FlowBoxChild -> Box -> (FlowBox -> FlowBoxChild -> DrawingArea * 6), (Box -> (Box -> (Label, Label), Button))

      const setTile = new Gtk.Box({
        orientation: 1,
        hexpand: true,
      });

      const setTilePreviewFlowBox = new Gtk.FlowBox({
        sensitive: false,
        minChildrenPerLine: 3,
        maxChildrenPerLine: 6,
      });

      const previewModel = Gio.ListStore.new(Icon);

      for (let i = 0; i < this.maxPreviewIcons && i < set.icons.get_n_items(); i++) {
        const icon = set.icons.get_item(i);
        previewModel.append(icon);
      }

      setTilePreviewFlowBox.bind_model(previewModel, (icon) => this._addPreviewItem(icon, this.iconPreviewSize));


      const setLabel = new Gtk.Label({
        label: set.name,
        cssClasses: ['title-3'],
        hexpand: true,
        halign: 1,
      });

      const setIconCount = new Gtk.Label({
        label: set.iconsCount.toString(),
        opacity: 0.7,
        halign: 1,
      });

      const setTileTextBox = new Gtk.Box({
        spacing: 2,
        orientation: 1,
      });

      const setTileInfoRowBox = new Gtk.Box({
        spacing: 8,
        hexpand: true,
        cssClasses: ['m-2'],
      });

      const overflowMenuModel = Gio.Menu.new();
      overflowMenuModel.append('Delete set', 'win.delete_set::' + set.name);

      const setTileButton = new Gtk.MenuButton({
        iconName: "view-more-symbolic",
        halign: 2,
        valign: 3,
        cssClasses: ['flat'],
        menuModel: overflowMenuModel,
      });

      setTileTextBox.append(setLabel);
      setTileTextBox.append(setIconCount);

      setTileInfoRowBox.append(setTileTextBox);
      setTileInfoRowBox.append(setTileButton);

      setTile.append(setTilePreviewFlowBox);
      setTile.append(setTileInfoRowBox);

      const setFlowBoxChild = new Gtk.FlowBoxChild({
        child: setTile,
        name: set.name,
        cssClasses: ['card', 'activatable'],
      });

      this._installed_sets_flowbox.append(setFlowBoxChild);

    });


  }

  #initializeDefaultSets(){
    this.defaultSets = [];

    // Clear the contents of the flowbox
    this._default_sets_flowbox.remove_all();

    // Load the resource files
    // Open the icon bundle resource Dir
    const bundledIconsDir = '/design/chris_wood/IconBear/icon-sets/';

    // Loop over the subdirectories of resources
    const bundledIconsDirs = Gio.resources_enumerate_children(bundledIconsDir, 0);

    // Sort in alphabetical order
    bundledIconsDirs.sort();

    bundledIconsDirs.forEach(folderPath => {

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

      const metaFile = Gio.File.new_for_uri('resource://' + bundledIconsDir + folderPath + 'meta.json');

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


      const resourceDir = bundledIconsDir + setId;
      const iconsDir = resourceDir + '/icons/';
      const iconFilenames = Gio.resources_enumerate_children(iconsDir, 0);


      // Remove the icons from the array which have already been loaded during initial app load
      iconFilenames.sort();
      iconFilenames.splice(0, this.maxPreviewIcons);

      const iconsArray = [];
      let i = 0;

      // Load the maxPreviewIcons number of icons into the icons list store property in alphabetical order
      iconFilenames.forEach(iconFilename => {

        if (i < this.maxPreviewIcons){

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
            width: 12,
            height: 12,
            style: 1,
          });

          // console.log(icon.label);
          iconsArray.push(icon);

          i++;

          // Add the icon into the set's list store
          set.icons.append(icon);

        }

        set.iconsCount ++;


      });


      console.log(set);

      // Store this set in the defaultSets property
      this.defaultSets.push(set);

      // Detect whether this set has already been installed
      let setIsInstalled = false;

      this.installedSets.filter((entry) => {
        // console.log(entry.name, set.name);
        if(entry.name === set.name){
          setIsInstalled = true;
        }
      });

      // If this set has not already been installed, create a FlowBoxChild for this set with an "Install" button
      if(!setIsInstalled){

        console.log(set.name + ' has not been installed');
        // FlowBoxChild -> Box -> (FlowBox -> FlowBoxChild -> DrawingArea * 6), (Box -> (Box -> (Label, Label), Button))

        const setTile = new Gtk.Box({
          orientation: 1,
          hexpand: true,
        });

        const setTilePreviewFlowBox = new Gtk.FlowBox({
          sensitive: false,
          minChildrenPerLine: 3,
          maxChildrenPerLine: 6,
        });

        const previewModel = Gio.ListStore.new(Icon);

        for (let i = 0; i < this.maxPreviewIcons && i < set.icons.get_n_items(); i++) {
          const icon = set.icons.get_item(i);
          previewModel.append(icon);
        }

        setTilePreviewFlowBox.bind_model(previewModel, (icon) => this._addPreviewItem(icon, this.iconPreviewSize));


        const setLabel = new Gtk.Label({
          label: set.name,
          cssClasses: ['title-3'],
          hexpand: true,
          halign: 1,
        });

        const setIconCount = new Gtk.Label({
          label: set.iconsCount.toString(),
          opacity: 0.7,
          halign: 1,
        });

        const setTileTextBox = new Gtk.Box({
          spacing: 2,
          orientation: 1,
        });

        const setTileInfoRowBox = new Gtk.Box({
          spacing: 8,
          hexpand: true,
          cssClasses: ['m-2'],
        });

        const setTileButton = new Gtk.Button({
          label: "Install",
          // cssClasses: ['suggested-action'],
          halign: 2,
          valign: 3,
        });

        setTileButton.connect('clicked', () => this.onDefaultSetInstall(set, resourceDir));

        setTileTextBox.append(setLabel);
        setTileTextBox.append(setIconCount);

        setTileInfoRowBox.append(setTileTextBox);
        setTileInfoRowBox.append(setTileButton);

        setTile.append(setTilePreviewFlowBox);
        setTile.append(setTileInfoRowBox);

        const setFlowBoxChild = new Gtk.FlowBoxChild({
          child: setTile,
          name: set.name,
          cssClasses: ['frame'],
        });

        this._default_sets_flowbox.append(setFlowBoxChild);

      }

    });

  }

  onSetActivated(_flowbox, _child){
    this.emit('set-activated', _child.name);
    _flowbox.unselect_all();
  }

  /**
  * Import a default set from GResource to the user's data directory.
  * @param {Set} set - The set object to import
  * @param {string} resourceDir - the resource uri where this set lives
  **/
  async onDefaultSetInstall(set, resourceDir){
    /*
			** Generate the icon-specific meta.json data with icon sizes and styles.
			** * Additionally, if no folder name present, check for the ending of the filename. e.g. ("-fill", "-filled", "-outline", "-duotone", "-color", "-colored")
			** Copy the meta.json to the user's data directory
			** Copy the contents of icons folder to the user's data directory.
		*/

		// Create the set data directory
    const dataDir = GLib.get_user_data_dir();
    const targetPath = dataDir + '/' + set.id;

    const targetDir = Gio.File.new_for_path(targetPath);
    targetDir.make_directory(null);

    const targetIconsDir = Gio.File.new_for_path(targetPath + '/icons');
    targetIconsDir.make_directory(null);

    // Set additional properties
    const setMeta = {
      name: set.name,
      license: set.license,
      author: set.author,
      website: set.website,
      createdOn: Date.now(),
      icons: [],
      iconCount: 0
    }

    // Get all the icons
    const iconsDir = resourceDir + '/icons/';
    const iconFilenames = Gio.resources_enumerate_children(iconsDir, 0);

    // Sort icons alphabetically
    iconFilenames.sort();

    const iconsArray = [];

    // Load all icons
    iconFilenames.forEach(iconFilename => {

      try {

        // Create the Gio.File for this icon resource and get its file info
        const iconFile = Gio.File.new_for_uri('resource://' + iconsDir + iconFilename);
        const fileInfo = iconFile.query_info('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

        const label = iconFilename.replace(/\.[^/.]+$/, "");

        // Determine the width and height of the icon
        const pixbuf = GdkPixbuf.Pixbuf.new_from_resource(iconsDir + iconFilename);
        const width = pixbuf.width;
        const height = pixbuf.height;


        const style = estimateIconStyle(iconFile);

        // Create a new Icon
        /*
        const icon = new Icon({
          label,
          filepath: iconsDir + iconFilename,
          type: fileInfo.get_file_type(),
          gfile: iconFile,
          width: width,
          height: height,
          style: style,
        });
        */

        // Set up the icon metadata
        const iconMeta = {
          fileName: iconFilename,
          width,
          height,
          style,
        };

        // console.log(iconMeta.style);
        setMeta.icons.push(iconMeta);

        setMeta.iconCount++;

      } catch(e) {
        console.log('Error creating iconMeta object: ' + e);
      }

    });

    // Save the "set" object as JSON in a new file called meta.json
    // Create the new file in the set directory
    try {
      const metaFile = Gio.File.new_for_path(targetPath + '/meta.json');
      const metaOutputStream = await metaFile.create_async(Gio.FileCreateFlags.NONE,
      GLib.PRIORITY_DEFAULT, null);

      // Populate the file with the JSON contents
      const metaBytes = new GLib.Bytes(JSON.stringify(setMeta));
      const metaBytesWritten = await metaOutputStream.write_bytes_async(metaBytes,
      GLib.PRIORITY_DEFAULT, null, null);
    } catch(e) {
      console.log('Error writing meta file: ' + e)
      return false;
    }


    // Copy the icon files to the targetDir/icons
    try {
      for (const icon of setMeta.icons) {
        const source = Gio.File.new_for_uri('resource://' + resourceDir + '/icons/' + icon.fileName);
        const target = Gio.File.new_for_path(targetPath + '/icons/' + icon.fileName);

        await source.copy_async(target, Gio.FileCopyFlags.NONE, GLib.PRIORITY_DEFAULT, null, null, () => { return true});

        console.log(`copied icon from resource://${resourceDir}/icons/${icon.fileName} to ${targetPath}/icons/${icon.fileName}`);
      }
    } catch(e) {
      console.log('Error copying icon files: ' + e);
    }

    try {

      this.emit('set-added', set.id);
    } catch(e) {
      console.log('Error updating the sets in the app: ' + e);
    }
  }

});
