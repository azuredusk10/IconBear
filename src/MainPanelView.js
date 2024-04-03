import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { IconTile } from './IconTile.js';
import { Icon } from './Icon.js';
import { drawSvg } from './drawSvg.js';

export const MainPanelView = GObject.registerClass({
  GTypeName: 'IcoMainPanelView',
  Template: 'resource:///design/chris_wood/IconBear/ui/MainPanelView.ui',
  InternalChildren: ['icons_grid_view'],
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

    this.#createListViewFactory();

    this.connect('notify::icons', () => {
      // Filter the icons whenever the parent list store changes and when it's been fully populated.

      if(this.icons){
        // The number of items in the list store property returns 0 until it's been fully populated.
        // Once populated, filter it and bind the model.
        if(this.icons.get_n_items() > 0){
          console.log('icons list store loaded')
          //this._iconsFlowbox.bind_model(this.icons, (icon) => this._addItem(icon, this.iconSize));
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
        // this._iconsFlowbox.get_child_at_index(i).show();
      } else {
        // this._iconsFlowbox.get_child_at_index(i).hide();
      }

      i++;
    }
  }

  #createListViewFactory(){
    const factory = new Gtk.SignalListItemFactory();

    // Set up the permanent parts of the ListItem (e.g. constructing widgets and adding them to the ListItem)
    factory.connect('setup', (factory, listItem) => {

      // Box -> (DrawingArea, Label, GestureClick, GestureClick)
      const topLevelBox = new Gtk.Box({
        spacing: 4,
        orientation: 1,
        marginStart: 4,
        marginEnd: 4,
        marginTop: 4,
        marginBottom: 4,
        cssClasses: ['card', 'card--icon', 'activatable'],
      });

      const drawingArea = new Gtk.DrawingArea({
        widthRequest: 24,
        heightRequest: 24,
        marginTop: 8,
        marginBottom: 8,
        cssClasses: ['icon-grid__image'],
      })

      drawingArea.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, listItem.item.gfile));

      const label = new Gtk.Label({
        maxWidthChars: 10,
        widthChars: 10,
        ellipsize: 3,
        widthRequest: 60,
        marginStart: 4,
        marginEnd: 4,
        opacity: 0.7,
        cssClasses: ['caption', 'icon-grid__label']
      });

      topLevelBox.append(drawingArea);
      topLevelBox.append(label);


      listItem.set_child(topLevelBox);
    });

    // Bind properties to the widgets in the ListItem
    factory.connect('bind', (factory, listItem) => {
      const topLevelBox = listItem.get_child();
      const drawingArea = topLevelBox.get_first_child();
      const label = drawingArea.get_next_sibling();

      label.label = listItem.item.label;
    });

    // Remove bindings for widgets in the ListItem
    factory.connect('unbind', (factory, listItem) => {

    });

    factory.connect('teardown', (factory, listItem) => {
      // Clean up any resources or references here
      // For example, if you created a custom object for the listItem:
      // listItem.customObject = null;
    });

    this._icons_grid_view.factory = factory;
  }

  // Create a new child of the Flowbox
  /*
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
  */


  onIconActivated(selection) {
    const icon = selection.get_selected_item();
    this.emit('icon-activated', icon.label, icon);
  }

  onIconCopied(emitter) {
    this.emit('icon-copied');
  }

});
