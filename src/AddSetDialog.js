import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';
import { drawSvg } from './drawSvg.js';

export const AddSetDialog = GObject.registerClass({
  GTypeName: 'IcoAddSetDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/AddSetDialog.ui',
  InternalChildren: ['add_set_dialog'],
  Properties: {
  },
  Signals: {
  },
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }

  onCancelClicked() {
    this._add_set_dialog.close();
  }

});
