import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const SkeletonStackView = GObject.registerClass({
  GTypeName: 'IcoSkeletonStackView',
  Template: 'resource:///design/chris_wood/IconBear/ui/SkeletonStackView.ui',
  InternalChildren: [],
  Properties: {
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }


});
