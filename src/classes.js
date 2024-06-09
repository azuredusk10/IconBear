import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

export const Set = GObject.registerClass({
  GTypeName: 'IcoSet',
  Properties: {
    id: GObject.ParamSpec.string(
      'id',
      'ID',
      'An alphanumeric set ID',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    name: GObject.ParamSpec.string(
      'name',
      'Name',
      'Name of the set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    author: GObject.ParamSpec.string(
      'author',
      'Author',
      'Author of the set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    license: GObject.ParamSpec.string(
      'license',
      'License',
      'License of the set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    website: GObject.ParamSpec.string(
      'website',
      'Website',
      'Website of the set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    iconsCount: GObject.ParamSpec.int(
      'iconsCount',
      'Icons Count',
      'Number of icons in the set',
      GObject.ParamFlags.READWRITE,
      0, 100000,
      0
    ),
    icons: GObject.ParamSpec.jsobject(
      'icons',
      'Icons',
      'Icons in the set, stored in a Gio.ListStore',
      GObject.ParamFlags.READWRITE
    ),
  }
}, class extends GObject.Object {});

/*
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
    style: GObject.ParamSpec.int(
      'style',
      'Style',
      'Style of the icon. 0 = undefined, 1 = outline, 2 = filled, 3 = duotone, 4 = color',
      GObject.ParamFlags.READWRITE,
      0, 4,
      0
    ),
  },
}, class extends GObject.Object {});
*/
