import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

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
}, class extends Gtk.Widget{} );
