import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';
import { drawSvg } from './drawSvg.js';

Gio._promisify(
  Gtk.FileDialog.prototype,
  "open_multiple",
  "open_multiple_finish",
);

export const AddSetDialog = GObject.registerClass({
  GTypeName: 'IcoAddSetDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/AddSetDialog.ui',
  InternalChildren: ['add_set_dialog'],
  Properties: {
    folder: GObject.ParamSpec.object(
      'folder',
      'Folder',
      'The folder that the user wishes to import',
      GObject.ParamFlags.READWRITE,
      Gio.File
    ),
    iconFiles: GObject.ParamSpec.object(
      'iconFiles',
      'Icon Files',
      'A ListStore of the icon files that are inside the folder',
      GObject.ParamFlags.READWRITE,
      Gio.ListStore
    ),
  },
  Signals: {
  },
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

  }

  set folder(folder){
    // Open the dialog
    this._add_set_dialog.present(this);

    // This property was changed by a parent widget; tell the widget that it's changed.
    this.notify('folder');

    // Populate the iconFiles ListStore
    const enumerator = folder.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);
    const folderPath = folder.get_path();

    console.log(folderPath);

    let iconsCount = 0;
    let info;

    // TODO: Iterate through child folders and get svgs from them too.

    while ((info = enumerator.next_file(null)) !== null) {

        if (info.get_content_type() === 'image/svg+xml') {


            // TODO: get the relevant properties for creating the new Icon and saving it to the listStore
            const icon = new Icon({
              //label,
              //filepath: folderPath + iconFilename,
              //type: fileInfo.get_file_type(),
              //gfile: iconFile,
            });

            iconsCount++;
        }
    }

    // Update the dialog header to state how many icons the folder contains
    this._add_set_dialog.title = `Import ${iconsCount} icons`;


  }

  onCancelClicked() {
    this._add_set_dialog.close();
  }

});
