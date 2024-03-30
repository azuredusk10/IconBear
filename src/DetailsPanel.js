import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { drawSvg } from './drawSvg.js';

export const DetailsPanel = GObject.registerClass({
  GTypeName: 'IcoDetailsPanel',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/DetailsPanel.ui',
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
    ),
  },
  InternalChildren: ['preview_image'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.#renderPreview();
    this.connect('notify::filepath', () => this.#renderPreview());
  }

  #renderPreview(){

    if(this.filepath){
      console.log(this.filepath);
      this._preview_image.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.filepath));
    }

  }

});
