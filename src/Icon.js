import GObject from 'gi://GObject';

export const Icon = GObject.registerClass({
  GTypeName: 'IcoIcon',
  Properties: {
    label: GObject.ParamSpec.string('label', 'Label', 'Name of the icon', GObject.ParamFlags.READWRITE, ''),
    filepath: GObject.ParamSpec.string('filepath', 'Filepath', 'Path to the icon file', GObject.ParamFlags.READWRITE, '')
  },
}, class extends GObject.Object {});
