import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { drawSvg } from './drawSvg.js';

export const DetailsPanel = GObject.registerClass({
  GTypeName: 'IcoDetailsPanel',
  Template: 'resource:///design/chris_wood/IconBear/ui/DetailsPanel.ui',
  Properties: {
    icon: GObject.ParamSpec.object(
      'icon',
      'Icon',
      'The Icon in GObject format',
      GObject.ParamFlags.READWRITE,
      GObject.Object
    ),
    iconLabel: GObject.ParamSpec.string(
      'iconLabel',
      'Icon Label',
      'The icon label',
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
    setId: GObject.ParamSpec.string(
      'setId',
      'Set ID',
      'The id of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setIconsCount: GObject.ParamSpec.int(
      'setIconsCount',
      'Set Icon Count',
      'The number of icons in the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      0, 1000000
    ),
    setLicense: GObject.ParamSpec.string(
      'setLicense',
      'Set licence',
      'The license of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    iconIsSelected: GObject.ParamSpec.boolean(
      'iconIsSelected',
      'Icon Is Selected',
      'Whether or not an icon is currently selected',
      GObject.ParamFlags.READWRITE,
      false,
    ),
  },
  InternalChildren: ['preview_image', 'icons_count'],
  Signals: {
    'icon-copied': {},
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.connect('notify::icon', () => this.#updateIconDetails());
    this.#bindIconsCount();
  }

  #updateIconDetails(){

    if(this.icon && this.icon.gfile){

      // Redraw the preview icon
      this._preview_image.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.icon.gfile));

      // Bind the icon label to the icon object's label'
      this.iconLabel = this.icon.label

      // Show the "icon selected" view
      this.iconIsSelected = true;

    } else {
      // Show the empty state view
      this.iconIsSelected = false;
    }

  }

  #bindIconsCount(){
    // Appends the word "icons" onto the setIconsCount property and binds it to the label in the empty state
    this.bind_property_full('setIconsCount', this._icons_count, 'label', GObject.BindingFlags.SYNC_CREATE, (binding, value) => [true, value + ' icons'], null);
  }

  onCopyButtonClicked(emitter){
    this.emit('icon-copied');
  }

});
