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
    filteredIcons: GObject.ParamSpec.object(
      'filteredIcons',
      'Filtered Icons',
      'The list model containing the icons from the current set, filtered by the search entry text',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
    searchEntryText: GObject.ParamSpec.string(
      'searchEntryText',
      'Search Entry Text',
      'The user-inputted value of the search entry',
      GObject.ParamFlags.READWRITE,
      ''
    )
  },
  Signals: {
    'icon-activated': {
      param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING]
    },
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

    // Reset the filtered icons list store
    this.filteredIcons = new Gio.ListStore(Icon);

    // loop over each item in the listStore - use value of get_n_items to decide how many times to iterate over the "get" list store method.
    let i=0;
    let totalIcons = this.icons.get_n_items();
    const re = new RegExp(this.searchEntryText, "i");

    while(i < totalIcons) {
      const singleIcon = this.icons.get_item(i);

      if(re.test(singleIcon.label)){
        this.filteredIcons.append(singleIcon);
      }

      i++;
    }


    // if it matches the regex expression, append it to filteredItems
    console.log(this.filteredIcons.get_n_items(), 'filtered icons');

    this._iconsFlowbox.bind_model(this.filteredIcons, this._addItem);

    // Tell the app that the filteredIcons list store has changed
    this.notify('filteredIcons');
  }

  // Create a new child of the Flowbox
  _addItem(icon){

    const newItem = new IconTile({
      filepath: icon.filepath,
      label: icon.label.substring(0, 20),
    });

    return newItem;
  }


  onIconActivated(_flowbox, _child) {
    this.emit('icon-activated', _child.filepath, _child.label);
  }

});
