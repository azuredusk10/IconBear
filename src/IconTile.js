import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

import { drawSvg } from './drawSvg.js';


export const IconTile = GObject.registerClass({
  GTypeName: 'IcoIconTile',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/IconTile.ui',
  Properties: {
    Label: GObject.ParamSpec.string(
      'label',
      'Label',
      'The icon label',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    width: GObject.ParamSpec.double(
      'width',
      'Width',
      'Width to render the icon at in pixels',
      GObject.ParamFlags.READWRITE,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
      24
    ),
    height: GObject.ParamSpec.double(
      'height',
      'Height',
      'Height to render the icon at in pixels',
      GObject.ParamFlags.READWRITE,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
      24
    ),
    icon: GObject.ParamSpec.object(
      'icon',
      'Icon',
      'The Icon in GObject format',
      GObject.ParamFlags.READWRITE,
      GObject.Object
    ),
  },
  InternalChildren: ['icon_tile_popover_menu', 'icon_box', 'icon_label'],
  Signals: {
    'icon-copied': {
      param_types: [GObject.TYPE_OBJECT]
    },
  }
}, class extends Gtk.FlowBoxChild{
  constructor(params){
    super(params);
    this.#renderIcon();
    this.connect('notify::width', () => {
      console.log('width of IconTile changed');
    })
  }

  #renderIcon(){
    const svgWidget = new Gtk.DrawingArea({
      widthRequest: this.width,
      heightRequest: this.height,
      marginTop: 8,
      marginBottom: 8,
      cssClasses: ['icon-grid__image'],
    })

    svgWidget.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.icon.gfile));

    svgWidget.insert_before(this._icon_box, this._icon_label);
  }

  onRightClick(_self, _n_press, x, y) {

    // Copying the icon as a placeholder
    this.emit('icon-copied', this.icon.gfile);


    // TODO: get the right-click menu items working
    /*
    const position = new Gdk.Rectangle({ x: x, y: y });
    this._icon_tile_popover_menu.pointing_to = position;
    this._icon_tile_popover_menu.popup();
    */
  }

  onLeftClick(_self, _n_press, x, y){
    if(_n_press == 2){
      this.emit('icon-copied', this.icon.gfile);
    }
  }

} );
