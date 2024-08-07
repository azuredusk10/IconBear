import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';


export const PreferencesDialog = GObject.registerClass({
  GTypeName: 'IcoPreferencesDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/PreferencesDialog.ui',
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }
});
