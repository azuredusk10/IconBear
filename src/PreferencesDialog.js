import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';


export const PreferencesDialog = GObject.registerClass({
  GTypeName: 'IcoPreferencesDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/PreferencesDialog.ui',
  InternalChildren: ['preferred_copy_method_row'],
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
    this.bindPreferredCopyMethodSubtitle();
  }

  bindToSettings() {
    settings.bind('preferred-copy-method', this, 'preferredCopyMethod', Gio.SettingsBindFlags.DEFAULT);
  }

  bindProperties() {
    this.bind_property('preferredCopyMethod', this._preferred_copy_method_row, 'selected', GObject.BindingFlags.BIDIRECTIONAL);
  }

  bindPreferredCopyMethodSubtitle() {
    const subtitles = [
      `Copies a temporary file to the clipboard (best for design software). This converts em/rem units to pixels and preserves the file name.`,
      `Copies the file contents to the clipboard (best for coding). Preserves the original code and lets you paste it directly into a code editor, but some apps won't recognise this as an image.`
    ];

    this._preferred_copy_method_row.connect('notify::selected', () => {
      const selectedIndex = this._preferred_copy_method_row.selected;
      this._preferred_copy_method_row.subtitle = subtitles[selectedIndex];
    });
  }
});
