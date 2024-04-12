import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

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

  /* Load a directory of icons for import
   * @param {Gio.File} folder - the user-selected folder containing the svg icons to import
   */
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

        const iconPath = folderPath + '/' + info.get_name();

        // Determine the width and height of the icon
        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(iconPath);
        const width = pixbuf.width;
        const height = pixbuf.height;

        // Load the contents of the SVG file
        const gFile = Gio.File.new_for_path(iconPath);
        const [, contents] = gFile.load_contents(null);
        const stringContents = new TextDecoder().decode(contents);
        //console.log(stringContents);
        let style; // 1 = outlined, 2 = filled, 3 = duotone, 4 = color

        // Take an educated guess as to the icon's style

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

        console.log('style', style);
        console.log('name', info.get_name());


        const iconMeta = {
          width,
          height,
          style: 0
        };

        iconsCount++;
      }
    }

    // Update the dialog header to state how many icons the folder contains
    this._add_set_dialog.title = `Import ${iconsCount} icons`;


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

  onCancelClicked() {
    this._add_set_dialog.close();
  }

});
