import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

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
    iconStyle: GObject.ParamSpec.string(
      'iconStyle',
      'Icon Style',
      'The icon style in readable text',
      GObject.ParamFlags.READWRITE,
      'Unknown'
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
    setAuthor: GObject.ParamSpec.string(
      'setAuthor',
      'Set author',
      'The author of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setWebsite: GObject.ParamSpec.string(
      'setWebsite',
      'Set website',
      'The website of the currently selected icon set',
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
  InternalChildren: ['preview_frame', 'preview_image', 'icons_count', 'icon_size_row', ],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.connect('notify::icon', () => this.#updateIconDetails());
    this.#bindProperties();
  }

  #updateIconDetails(){

    if(this.icon && this.icon.gfile){

      // Redraw the preview icon
      this._preview_image.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.icon.gfile));

      // Bind the icon label to the icon object's label
      this.iconLabel = this.icon.label

      // Show the "icon selected" view
      this.iconIsSelected = true;

      this._icon_size_row.subtitle = `${this.icon.width} × ${this.icon.height}`;

      // Apply special frame styling in dark mode if the icon is of style 'color'
      if(this.icon.style == 4){
        this._preview_frame.add_css_class('preview-frame--color-icon');
      } else {
        this._preview_frame.remove_css_class('preview-frame--color-icon');
      }

      // Show the correct word for the style
      switch(this.icon.style){
        case 1:
          this.iconStyle = 'Outline';
          break;
        case 2:
          this.iconStyle = 'Filled';
          break;
        case 3:
          this.iconStyle = 'Duotone';
          break;
        case 4:
          this.iconStyle = 'Color';
          break;
        default:
          this.iconStyle = 'Unknown';

      }



    } else {
      // Show the empty state view
      this.iconIsSelected = false;
    }

  }

  #bindProperties(){
    // Appends the word "icons" onto the setIconsCount property and binds it to the label in the empty state
    this.bind_property_full('setIconsCount', this._icons_count, 'label', GObject.BindingFlags.SYNC_CREATE, (binding, value) => [true, value + ' icons'], null);

    // Output the original width and height of the icon as the string "[width] x [height]"

  }

  /*
  onOpenLocation(){
    const location = this.icon.filepath.substring(0, this.icon.filepath.lastIndexOf("/"));

    try {
        Gio.AppInfo.launch_default_for_uri('file:///' + location, null);

    } catch (e) {
        logError(e);
    }


  }
  */


});
