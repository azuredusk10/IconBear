import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

import { Icon } from './Icon.js';

// Set up async file methods
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');

export const AddSetDialog = GObject.registerClass({
  GTypeName: 'IcoAddSetDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/AddSetDialog.ui',
  InternalChildren: ['add_set_dialog', 'new_set_name_entry', 'import_button', 'spinner', 'form_wrapper'],
  Properties: {
    folder: GObject.ParamSpec.object(
      'folder',
      'Folder',
      'The folder that the user wishes to import',
      GObject.ParamFlags.READWRITE,
      Gio.File
    ),
    icons: GObject.ParamSpec.jsobject(
      'icons',
      'Icons',
      'An array of icons that are processed and ready to import',
      GObject.ParamFlags.READWRITE,
      []
    ),
    processing: GObject.ParamSpec.boolean(
      'processing',
      'Processing',
      'Whether file operations are in progress',
      GObject.ParamFlags.READWRITE,
      true
    ),
  },
  Signals: {
  },
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

  }


  /* Load a directory of icons for import. Called by Window.js to activate this widget.
   * @param {Gio.File} folder - the user-selected folder containing the svg icons to import
   */
  async prepareImport(folder){

     // Open the dialog
    this._add_set_dialog.present(this);

    // Update the 'folder' property
    this.folder = folder;
    this.notify('folder');

    // Clear the 'icons' property
    this.icons = [];
    this.notify('icons');

    // Populate the iconFiles ListStore
    const iter = await folder.enumerate_children_async('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);
    const folderPath = folder.get_path();
    const folderName = folder.get_basename();

    console.log('folder name:', folderName );
    let iconsCount = 0;

    // TODO: Iterate through child folders and get svgs from them too.

    for await (const info of iter) {

      if (info.get_content_type() === 'image/svg+xml') {

        const iconFilename = info.get_name();
        const iconPath = folderPath + '/' + iconFilename;

        // Determine the width and height of the icon
        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(iconPath);
        const width = pixbuf.width;
        const height = pixbuf.height;

        // Load the contents of the SVG file
        const gFile = Gio.File.new_for_path(iconPath);
        const [, contents] = gFile.load_contents(null);
        const stringContents = new TextDecoder().decode(contents);
        //console.log(stringContents);
        let style; // 1 = outline, 2 = filled, 3 = duotone, 4 = color

        // Try guessing the icon's style from the name of its parent folder
        const outlineFolderMatches = folderName.match(/outline/i) || [];
        const filledFolderMatches = folderName.match(/fill|solid/i) || [];
        const duotoneFolderMatches = folderName.match(/twotone|duotone/i) || [];

        if(outlineFolderMatches.length > 0){
          style = 1;
        } else if(filledFolderMatches.length > 0){
          style = 2;
        } else if(duotoneFolderMatches.length > 0){
          style = 3;
        }

        // If the icon style can't be determined by its parent folder name, then try guessing the icon's style from its SVG attributes
        if(typeof style === "undefined"){

          // Detect if a "stroke" attribute is present, but not if it's followed by "none"
          const strokeMatches = stringContents.match(/\bstroke=(?!"none")/g) || [];
          // console.log('stroke matches', strokeMatches.length);

          // Detect if a "fill" attribute is present, but not if it's followed by "none"
          const fillMatches = stringContents.match(/\bfill=(?!"none")/g) || [];
          // console.log('fill matches', fillMatches.length);

          // Detect the number of colours present
          const uniqueColors = this.countUniqueColorsFromString(stringContents);
          // console.log('colors', uniqueColors)

          if(uniqueColors > 2){
            // It has multiple colors, it's a color icon
            style = 4;

          } else if(uniqueColors == 2){
            // It has 2 colors, it's a duotone icon
            style = 3;

          } else if(fillMatches.length > 0){
            // It has at least 1 fill, it's a filled icon
            style = 2;

          } else if(strokeMatches.length > 0){
            // It contains no fills, only strokes; it's an outlined icon
            style = 1;

          }

        }

        //console.log('style', style);
        // console.log('name', info.get_name());


        const iconMeta = {
          fileName: iconFilename,
          width,
          height,
          style,
        };

        //console.log(JSON.stringify(iconMeta));

        // Push this to the icon store
        this.icons.push(iconMeta);

        iconsCount++;
      }
    }

    console.log('after for loop');

    // Update the dialog header to state how many icons the folder contains
    this._add_set_dialog.title = `Import ${iconsCount} icons`;
    this.processing = false;
    this._import_button.sensitive  = true;
    this._spinner.visible = false;
    this._form_wrapper.visible = true;


  }

  countUniqueColorsFromString(str) {
    // Regular expression to match hex color codes
    // Source: https://stackoverflow.com/a/53330328
    const hexColorRegex = /#(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})/gi;

    // Find all matches of hex color codes in the string
    const matches = str.match(hexColorRegex) || [];

    // Create a Set to store unique colors
    const uniqueColors = new Set(matches.map(match => match.replace('#', '')));

    // Check if "currentColor" is present in the string and count it as an additional color
    if (/\bcurrentColor\b/i.test(str)) {
      uniqueColors.add('currentColor');
    }

    // Return the size of the Set (number of unique colors)
    return uniqueColors.size;
  }

   /* Import the user-selected directory. Pulls the values of the "Set" and "New set name" entries.
   */
  importSet() {

    const newSetName = this._new_set_name_entry.text;

    // TODO: Handle importing to an existing set.

    // Import icons to a new set

    // Create the set's ID by converting spaces to hyphens and making all characters lowercase, then appending current timestamp.
    const newSetId = newSetName.replace(/\s+/g, "-").replace(/[A-Z]/g, (match) => match.toLowerCase()) + '-' + Date.now();

    // Create the set data directory
    const dataDir = GLib.get_user_data_dir();
    const targetPath = dataDir + '/' + newSetId;

    const targetDir = Gio.File.new_for_path(targetPath);

    targetDir.make_directory(null);

    // Prepare the set object which will eventually be saved to info.json
    const set = {
      name: newSetName,
      createdOn: Date.now(),
      icons: this.icons
    }

    // Add the iconSet
    console.log(JSON.stringify(set));

    // TODO: save the "set" object as JSON in a new file called info.json

    // TODO: Copy the icon files to the targetDir/icons, OR targetDir/[preserve child folder names from original import folder]



  }

  onCancelClicked() {
    this._add_set_dialog.close();
  }

});
