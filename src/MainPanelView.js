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
  InternalChildren: ['icons_grid_view', 'icons_selection', 'icons_filter_model'],
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
    prevSearchEntryText: GObject.ParamSpec.string(
      'prevSearchEntryText',
      'Previous Search Entry Text',
      'The user-inputted value of the search entry prior to the current entry',
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
    this.#createFilterModel();

    this.connect('notify::searchEntryText', (a, b) => {
      if(this.icons){
         if(this.icons.get_n_items() > 0){

          // By default, the filter will be applied without optimisation.
          let filterSpecificity = Gtk.FilterChange.DIFFERENT;

          // Detect whether the model should be filtered for more or less items
          // If search entry contains the contents of the previous entry and the new entry is longer, then assume filter is more specific.
          // clo -> CLOu
          if (RegExp(this.prevSearchEntryText, "i").test(this.searchEntryText) && this.prevSearchEntryText.length < this.searchEntryText.length){
            filterSpecificity = Gtk.FilterChange.MORE_STRICT;

            // If prev search entry contains the contents of the new entry and the new entry is shorter, then assume filter is less specific.
            // CLOu -> clo
          } else if(RegExp(this.searchEntryText, "i").test(this.prevSearchEntryText) && this.prevSearchEntryText.length > this.searchEntryText.length) {
            filterSpecificity = Gtk.FilterChange.LESS_STRICT;
          }

          // Apply the filter
          this._icons_filter_model.filter.changed(filterSpecificity);

          // Store the now-applied search entry in the prevSearchEntry property
          this.prevSearchEntryText = this.searchEntryText
         }
      }
    });
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
        opacity: 0.6,
        cssClasses: ['caption']
      });

      const leftClickGesture = new Gtk.GestureClick({
        button: 1
      });
      leftClickGesture.connect('pressed', (_self, _n_press, x, y) => this.onIconLeftClick(_self, _n_press, x, y));

      topLevelBox.append(drawingArea);
      topLevelBox.append(label);
      topLevelBox.add_controller(leftClickGesture);


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


  #createFilterModel(){
    this._icons_filter_model.filter = Gtk.CustomFilter.new(item => {

      // Check if the icon name contains the search entry text
      return RegExp(this.searchEntryText, "i").test(item.label)

    });
  }

  onIconLeftClick(_self, _n_press, x, y){
    if(_n_press == 2){
      this.emit('icon-copied');
    }
  }

  onIconActivated(selection) {
    const icon = selection.get_selected_item();
    this.emit('icon-activated', icon.label, icon);
  }

  onIconCopied(emitter) {
    this.emit('icon-copied');
  }

});
