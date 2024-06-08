import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

export const Icon = GObject.registerClass({
  GTypeName: 'IcoIcon',
  Properties: {
    label: GObject.ParamSpec.string('label', 'Label', 'Name of the icon', GObject.ParamFlags.READWRITE, ''),
    filepath: GObject.ParamSpec.string('filepath', 'Filepath', 'Path to the icon file', GObject.ParamFlags.READWRITE, ''),
    type: GObject.ParamSpec.enum('type', 'Type', 'File type', GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
    gFile: GObject.ParamSpec.object('gfile', 'GFile', 'GFile of the icon', GObject.ParamFlags.READWRITE, Gio.File),
    width: GObject.ParamSpec.int(
      'width',
      'Width',
      'Pixel width of the icon',
      GObject.ParamFlags.READWRITE,
      0, 10000,
      24
    ),
    height: GObject.ParamSpec.int(
      'height',
      'Height',
      'Pixel height of the icon',
      GObject.ParamFlags.READWRITE,
      0, 10000,
      24
    ),
  },
}, class extends GObject.Object {});
