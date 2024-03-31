import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';

export const AllSetsStackView = GObject.registerClass({
  GTypeName: 'IcoAllSetsStackView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/AllSetsStackView.ui',
  InternalChildren: ['sets_flowbox', 'main_stack'],
  Properties: {

  },
  Signals: {
    'set-activated': {},
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }

});
