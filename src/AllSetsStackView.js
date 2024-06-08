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
      0
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

  onSetActivated(_flowbox, _child){
    this.emit('set-activated', _child.name);
    _flowbox.unselect_all();
  }

});
