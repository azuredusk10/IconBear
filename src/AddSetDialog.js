import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

import { Icon } from './Icon.js';
import { estimateIconStyle } from './helperFunctions.js';

// Set up async file methods
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'create_async');

export const AddSetDialog = GObject.registerClass({
  GTypeName: 'IcoAddSetDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/AddSetDialog.ui',
  InternalChildren: ['add_set_dialog', 'new_set_name_entry', 'new_set_name_error', 'import_button', 'spinner', 'form_wrapper', 'completed_wrapper', 'stack', 'back_button', 'header_bar', 'destination_set', 'progress_bar', 'app_error_message'],
  Properties: {
    sets: GObject.ParamSpec.jsobject(
      'sets',
      'Sets',
      'All icon sets',
      GObject.ParamFlags.READWRITE
	  ),
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
    appWindow: GObject.ParamSpec.jsobject(
      'appWindow',
      'App Window',
      'Reference to the parent application window',
      GObject.ParamFlags.READWRITE
	  ),
  },
  Signals: {
    'set-added': {
      param_types: [GObject.TYPE_STRING]
    }
  },
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

    // Listen for changes to destination_set AdwComboRow
    this._destination_set.connect('notify::selected', () => this.onDestinationSetSelected());

    // Update the values of the "Set" ComboRow whenever the sets property changes
    this.connect('notify::sets', () => this.initializeDestinationSetComboRow());

    // Remove the error message when text is entered in the New Set Name field
    this._new_set_name_entry.connect('notify::text', () => {
      this._new_set_name_error.visible = false;
    });
  }

  /**
  * Opens this dialog a the first step
  * @param {Window} appWindow - an instance of the parent application window
  **/
  openDialog(appWindow){
    this._add_set_dialog.present(this);
    this._appWindow = appWindow;

    this._stack.set_visible_child_name('step1');

    this._back_button.visible = false;
    this._header_bar.showStartTitleButtons = true;
    this._header_bar.showEndTitleButtons = true;
  }

  async onSelectFolder(){

    // Prompt the user to select the folder of icons to import
    const fileDialog = new Gtk.FileDialog();
    let iconsCount = 0;

     // Open the dialog and handle user's selection
     fileDialog.select_folder(this._appWindow, null, async (self, result) => {
        try {
           const folder = self.select_folder_finish(result);

           if (folder) {
                 console.log(this.getFileName(folder));

                 // Initialise folder scanning
                 this._stack.set_visible_child_name('processing');
                 try {
                   iconsCount = await this.prepareImport(folder);
                 } catch(e){
                  this.throwError('Error preparing import: ' + e);
                  return;
                 }

                 console.log(iconsCount);

                 if (iconsCount === 0){
                  // Throw an error
                  this.throwError('No SVG icons were found. Make sure you selected the right folder');
                  return;
                 }

                // When complete, move onto import settings StackPage
                this._stack.set_visible_child_name('step2');
                this._add_set_dialog.title = `Import ${iconsCount} icons`;
                this._header_bar.showTitle = true;
                this._back_button.visible = true;
                this._new_set_name_entry.sensitive = true;
                this._destination_set.sensitive = true;
                this._import_button.visible = true;
                this._progress_bar.visible = false;

                // Replace hyphens in the folder name with spaces and then capitalise each word.
                const folderNameHyphensRemoved = this.getFileName(folder).replace(/-/g, ' ');
                const words = folderNameHyphensRemoved.split(' ');
                const capitalizedWords = words.map(word => word[0].toUpperCase() + word.slice(1).toLowerCase());
                const suggestedSetName = capitalizedWords.join(' ');


                const existingSet = this.sets.find((object) => {
                  return object.name === suggestedSetName;
                });

                if(existingSet) {
                  // If a set with this name exists, auto-select it from the "Set" ComboRow.
                  const model = this._destination_set.model;
                  let i=0;
                  while(model.get_item(i)){
                    if(model.get_item(i).get_string().toLowerCase() === suggestedSetName.toLowerCase()){
                      this._destination_set.set_selected(i);
                    }
                    i++;
                  }

                } else {
                  // If a set with this name doesn't exist, autofill the "New Set Name" field with this value.
                  this._new_set_name_entry.text = capitalizedWords.join(' ');
                }



           }
        } catch(_) {
           // user closed the dialog without selecting any file
            console.log(_);
           return;
        }

    });

  }

  getFileName(file) {
    const info = file.query_info(
      "standard::name",
      Gio.FileQueryInfoFlags.NONE,
      null,
    );
    return info.get_name();
  }

  onBackClicked(){
    this._stack.set_visible_child_name('step1');
    this._header_bar.showTitle = false;
    this._back_button.visible = false;
  }

  /**
  * Displays the error state
  * @param {string} message - the error message to display to the user
  **/
  throwError(message){
    this._stack.set_visible_child_name('error');
    this._app_error_message.label = message;
  }

  onImportSet() {
    // Check if the form entries are valid
    if(this._destination_set.selected === 0) {
      if(this._new_set_name_entry.textLength < 1) {
        this._new_set_name_error.visible = true;
        return;
      }
    }

    // Change the UI to the "importing" state
    // Make the entries insensitive
    this._new_set_name_entry.sensitive = false;
    this._destination_set.sensitive = false;

    // Hide the buttons
    this._import_button.visible = false;
    this._back_button.visible = false;

    // Show the progress bar
    this._progress_bar.visible = true;
    this._progress_bar.fraction = 0;

    // Hide the "Close" button
    this._header_bar.showStartTitleButtons = false;
    this._header_bar.showEndTitleButtons = false;

    // Begin the import process

  }


  /* Load a directory of icons for import. Called by Window.js to activate this widget.
   * @param {Gio.File} folder - the user-selected folder containing the svg icons to import
   */
  async prepareImport(folder){
    try {
      // Open the dialog
      // this._add_set_dialog.present(this);

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
          //console.log(stringContents);

          const style = estimateIconStyle(gFile, folderName);

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

      return iconsCount;

    } catch(e) {
      this.throwError('Error preparing for import: ' + e);
    }

  }

   /* Import the user-selected directory. Pulls the values of the "Set" and "New set name" entries.
   */
  async importSet() {

    // Show a "Processing" state
    this._import_button.label = 'Importing...';
    this._import_button.sensitive = false;

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

    const targetIconsDir = Gio.File.new_for_path(targetPath + '/icons');
    targetIconsDir.make_directory(null);

    // Prepare the set object which will eventually be saved to meta.json
    const set = {
      name: newSetName,
      createdOn: Date.now(),
      icons: this.icons
    }

    // Add the iconSet
    console.log(JSON.stringify(set));

    // Save the "set" object as JSON in a new file called meta.json
    // Create the new file in the set directory
    try {
      const metaFile = Gio.File.new_for_path(targetPath + '/meta.json');
      const metaOutputStream = await metaFile.create_async(Gio.FileCreateFlags.NONE,
      GLib.PRIORITY_DEFAULT, null);

      // Populate the file with the JSON contents
      const metaBytes = new GLib.Bytes(JSON.stringify(set));
      const metaBytesWritten = await metaOutputStream.write_bytes_async(metaBytes,
      GLib.PRIORITY_DEFAULT, null, null);
    } catch(e) {
      this.throwError('Error writing meta file: ' + e);
      return false;
    }


    // Copy the icon files to the targetDir/icons
    try {
      for (const icon of this.icons) {
        const source = Gio.File.new_for_path(this.folder.get_path() + '/' + icon.fileName);
        const target = Gio.File.new_for_path(targetPath + '/icons/' + icon.fileName);

        await source.copy_async(target, Gio.FileCopyFlags.NONE, GLib.PRIORITY_DEFAULT, null, null, null);

        console.log(`copied icon from ${this.folder.get_path()}/${icon.fileName} to ${targetPath}/${icon.fileName}`);
      }
    } catch(e) {
      this.throwError('Error copying icon files: ' + e);
    }


    // Show the "Completed" state
    this._form_wrapper.visible = false;
    this._completed_wrapper.visible = true;


    // Tell Window.js that a new set was added
    this.emit('set-added', newSetId);

    return true;
  }

  onCancelClicked() {
    this._add_set_dialog.close();
  }

  onStartAgain(){
    this.onBackClicked();
  }

  onDestinationSetSelected(){
    const selectedPosition = this._destination_set.selected;
    const selectedItem = this._destination_set.selected_item.get_string();

    // If "New set" has been selected, show the "New set name" entry
    if(selectedPosition === 0){
      this._new_set_name_entry.visible = true;
    } else {
      this._new_set_name_entry.visible = false;
      this._new_set_name_error.visible = false;
    }
  }

  /**
  * Populates the "Set" combo box with a "New set" option and the names of user's installed sets.
  **/
  initializeDestinationSetComboRow() {
    const model = Gio.ListStore.new(Gtk.StringObject);

    const newOption = Gtk.StringObject.new('New set');
    model.append(newOption);

    if(!this.sets) return;

    this.sets.forEach(set => {
      const setOption = Gtk.StringObject.new(set.name);
      model.append(setOption);
    });

    this._destination_set.model = model;
  }

});
