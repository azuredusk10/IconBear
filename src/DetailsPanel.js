import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { drawSvg } from './drawSvg.js';

export const DetailsPanel = GObject.registerClass({
  GTypeName: 'IcoDetailsPanel',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/DetailsPanel.ui',
  Properties: {
    Label: GObject.ParamSpec.string(
      'label',
      'Label',
      'The icon label',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    icon: GObject.ParamSpec.object(
      'icon',
      'Icon',
      'The Icon in GObject format',
      GObject.ParamFlags.READWRITE,
      GObject.Object
    ),
  },
  InternalChildren: ['preview_image'],
  Signals: {
    'icon-copied': {},
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.#renderPreview();
    this.connect('notify::icon', () => this.#renderPreview());
  }

  #renderPreview(){

    if(this.icon && this.icon.gfile){
      this._preview_image.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.icon.gfile));
    }

  }

  onCopyButtonClicked(emitter){
    this.emit('icon-copied');
  }

});
