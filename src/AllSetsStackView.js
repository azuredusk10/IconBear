import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';
import { drawSvg } from './drawSvg.js';

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
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

    // May need to call this once the icon sets have been loaded in correctly via properties
    this.connect('notify::installedSets', () => {
      // Filter the icons whenever the parent list store changes and when it's been fully populated.

      if(this.installedSets && this.installedSets[0]){

        // The number of items in the list store property returns 0 until it's been fully populated.
        // Once populated, filter it and bind the model.
        if(this.installedSets[0].icons && this.installedSets[0].icons.get_n_items() > 0){
          console.log('preview icons list store loaded')
          this.#initializeInstalledSetsFlowbox();
        }
      }
    });

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

      this._installed_sets_flowbox.append(setFlowBoxChild);
    });

  }

  #initializeDefaultSets(){
    this.defaultSets = [];

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

          console.log(icon.label);
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

      // Initialise the flowbox
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
        cssClasses: ['suggested-action'],
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
        cssClasses: ['card'],
      });

      this._default_sets_flowbox.append(setFlowBoxChild);

    });

  }

  onSetActivated(_flowbox, _child){
    this.emit('set-activated', _child.name);
    _flowbox.unselect_all();
  }

});
