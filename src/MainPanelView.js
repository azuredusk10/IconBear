import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { IconTile } from './IconTile.js';
import { Icon } from './Icon.js';

export const MainPanelView = GObject.registerClass({
  GTypeName: 'IcoMainPanelView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/MainPanelView.ui',
  InternalChildren: ['iconsFlowbox'],
  Properties: {
    icons: GObject.ParamSpec.object(
      'icons',
      'Icons',
      'The list model containing the icons from the current icon set',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
    searchEntryText: GObject.ParamSpec.string(
      'searchEntryText',
      'Search Entry Text',
      'The user-inputted value of the search entry',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setName: GObject.ParamSpec.string(
      'setName',
      'Set Name',
      'The name of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    iconsCount: GObject.ParamSpec.int(
      'iconsCount',
      'Icons Count',
      'The number of icons in this set',
      GObject.ParamFlags.READWRITE,
      0, 100000,
      0
    ),
    // TODO: replace with iconPreviewSize property
    iconSize: GObject.ParamSpec.double(
      'iconSize',
      'Icon Size',
      'The size to render icons in the Flowbox at',
      GObject.ParamFlags.READWRITE,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
      24
    ),
  },
  Signals: {
    'icon-activated': {
      param_types: [GObject.TYPE_STRING, GObject.TYPE_OBJECT]
    },
    'icon-copied': {},
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

    this.connect('notify::icons', () => {
      // Filter the icons whenever the parent list store changes and when it's been fully populated.

      if(this.icons){
        // The number of items in the list store property returns 0 until it's been fully populated.
        // Once populated, filter it and bind the model.
        if(this.icons.get_n_items() > 0){
          console.log('icons list store loaded')
          this._iconsFlowbox.bind_model(this.icons, (icon) => this._addItem(icon, this.iconSize));
          this.#filterIcons();
        }
      }
    });



    this.connect('notify::searchEntryText', () => {
      if(this.icons){
         if(this.icons.get_n_items() > 0){
          this.#filterIcons();
         }
      }
    });
  }

  #filterIcons(){
    // Set the filter condition
    const re = new RegExp(this.searchEntryText, "i");

    // Loop over each item in the list store
    let i=0;
    let totalIcons = this.icons.get_n_items();

    while(i < totalIcons) {
      const singleIcon = this.icons.get_item(i);

      // If the current item's label matches the filter condition, show the item in the FlowBox. Otherwise, hide it.
      if(re.test(singleIcon.label)){
        this._iconsFlowbox.get_child_at_index(i).show();
      } else {
        this._iconsFlowbox.get_child_at_index(i).hide();
      }

      i++;
    }
  }

  // Create a new child of the Flowbox
  _addItem(icon, size){

    // return new Gtk.FlowBoxChild({});

    const newItem = new IconTile({
      icon,
      label: icon.label.substring(0, 20),
      width: size,
      height: size,
    });

    newItem.connect('icon-copied', (emitter, mimeType, data) => this.onIconCopied(emitter, mimeType, data));

    return newItem;
  }


  onIconActivated(_flowbox, _child) {
    this.emit('icon-activated', _child.icon.label, _child.icon);
  }

  onIconCopied(emitter) {
    this.emit('icon-copied');
  }

});
