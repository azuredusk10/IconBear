import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';


export const PreferencesDialog = GObject.registerClass({
  GTypeName: 'IcoPreferencesDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/PreferencesDialog.ui',
  InternalChildren: ['preferred_copy_method_input'],
  Properties: {
   preferredCopyMethod: GObject.ParamSpec.int(
      'preferredCopyMethod',
      'Preferred Copy Method',
      'The user-defined setting for the default copy method',
      GObject.ParamFlags.READWRITE,
      0, 1,
      0
    ),
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.bindToSettings();
    this.bindProperties();
  }

  bindToSettings() {
    settings.bind('preferred-copy-method', this, 'preferredCopyMethod', Gio.SettingsBindFlags.DEFAULT);
  }

  bindProperties() {
    this.bind_property('preferredCopyMethod', this._preferred_copy_method_input, 'selected', GObject.BindingFlags.BIDIRECTIONAL);
  }
});
