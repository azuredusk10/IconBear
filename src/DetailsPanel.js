import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { IconPaintable } from './IconPaintable.js';

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
    )
  },
  InternalChildren: ['preview_image'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.#renderPreview();
    this.svgPaintable;
  }

  #renderPreview(){
    // Create the paintable
     this.svgPaintable = new IconPaintable({
      // filepath: this.filepath
    });

    console.log(this.svgPaintable);

    // Set the paintable property of the GtkImage
    // TODO: setting the image's paintable property breaks the app.
    //this._preview_image.paintable = this.svgPaintable;
  }

});
