import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

export const Icon = GObject.registerClass({
  GTypeName: 'IcoIcon',
  Properties: {
    label: GObject.ParamSpec.string('label', 'Label', 'Name of the icon', GObject.ParamFlags.READWRITE, ''),
    filepath: GObject.ParamSpec.string('filepath', 'Filepath', 'Path to the icon file', GObject.ParamFlags.READWRITE, ''),
    // icon: GObject.ParamSpec.object('icon', 'Icon', 'Icon for the file', GObject.ParamFlags.READWRITE, Gio.Icon),
    type: GObject.ParamSpec.enum('type', 'Type', 'File type', GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
    gFile: GObject.ParamSpec.object('gfile', 'GFile', 'GFile of the icon', GObject.ParamFlags.READWRITE, Gio.File)
  },
}, class extends GObject.Object {});
