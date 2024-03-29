import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

import { IconPaintable } from './IconPaintable.js';


export const IconTile = GObject.registerClass({
  GTypeName: 'IcoIconTile',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/IconTile.ui',
  Properties: {
    Filepath: GObject.ParamSpec.string(
      'filepath',
      'Filepath',
      'The filepath to the icon image to be displayed',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    Label: GObject.ParamSpec.string(
      'label',
      'Label',
      'The icon label',
      GObject.ParamFlags.READWRITE,
      ''
    )
  },
  InternalChildren: ['icon_tile_popover_menu', 'icon_box']
}, class extends Gtk.FlowBoxChild{
  constructor(params){
    super(params);
    this.#renderIcon();
  }

  onRightClick(_self, _n_press, x, y) {
    const position = new Gdk.Rectangle({ x: x, y: y });
    this._icon_tile_popover_menu.pointing_to = position;
    this._icon_tile_popover_menu.popup();
  }

  #renderIcon(){
    const svgPaintable = new IconPaintable({
      filepath: this.filepath
    });
    const svgWidget = new Gtk.Image({
      paintable: svgPaintable
    })
    this._icon_box.append(svgWidget);
  }

} );