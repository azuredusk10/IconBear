import GObject from 'gi://GObject';

export const Icon = GObject.registerClass({
  GTypeName: 'IcoIcon',
  Properties: {
    name: GObject.ParamSpec.string('name', 'Name', 'Name of the icon', GObject.ParamFlags.READWRITE, ''),

  },
}, class extends GObject.Object {});
