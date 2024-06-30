import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

import { Icon } from './Icon.js';
import { estimateIconStyle, getIconFileDimensions } from './helperFunctions.js';

// Set up async file methods
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'create_async');
Gio._promisify(Gio.File.prototype, 'copy_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');

export const AddSetDialog = GObject.registerClass({
  GTypeName: 'IcoAddSetDialog',
  Template: 'resource:///design/chris_wood/IconBear/ui/AddSetDialog.ui',
  InternalChildren: ['add_set_dialog', 'new_set_name_entry', 'new_set_name_error', 'import_button', 'spinner', 'form_wrapper', 'completed_wrapper', 'stack', 'back_button', 'header_bar', 'destination_set', 'import_spinner', 'app_error_message', 'success_message', 'prepare_import_progress'],
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
    newSetName: GObject.ParamSpec.string(
      'newSetName',
      'New set name',
      'The name of the set that the user successfully imported to',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    appWindow: GObject.ParamSpec.jsobject(
      'appWindow',
      'App Window',
      'Reference to the parent application window',
      GObject.ParamFlags.READWRITE
	  )
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
                this._import_spinner.visible = false;

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
    this._header_bar.showStartTitleButtons = true;
    this._header_bar.showEndTitleButtons = true;

  }

  async onImportSet() {
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

    // Show the progress spinner
    this._import_spinner.visible = true;

    // Hide the "Close" button
    this._header_bar.showStartTitleButtons = false;
    this._header_bar.showEndTitleButtons = false;

    let dataDir;
    let targetPath;
    let targetDir;
    let targetIconsDir;
    let newSetId;
    let newSetName;
    let set;

    // Begin the import process
    try {

      newSetName = this._new_set_name_entry.text;

      // TODO: Handle importing to an existing set.

      // Import icons to a new set

      // Create the set's ID by converting spaces to hyphens and making all characters lowercase, then appending current timestamp.
      newSetId = newSetName.replace(/\s+/g, "-").replace(/[A-Z]/g, (match) => match.toLowerCase()) + '-' + Date.now();

      // Create the set data directory
      dataDir = GLib.get_user_data_dir();
      targetPath = dataDir + '/' + newSetId;

      targetDir = Gio.File.new_for_path(targetPath);
      targetDir.make_directory(null);

      targetIconsDir = Gio.File.new_for_path(targetPath + '/icons');
      targetIconsDir.make_directory(null);


    } catch(e) {
      this.throwError('Error creating set folder: ' + e);
    }

    //console.log(JSON.stringify(set));


    // Copy the icon files to the targetDir/icons
    try {

      for (const icon of this.icons) {

        // console.log('beginning copy of ' + this.folder.get_path() + '/' + icon.fileName + ' to ' + targetPath + '/icons/' + icon.fileName);

        // const source = Gio.File.new_for_path(icon.sourcePath);
        // const target = Gio.File.new_for_path(targetPath + '/icons/' + icon.fileName);

        // console.log('About to copy');
        const sourceFileName = icon.fileName;
        const newFileName = await this.copyFileWithRename(icon.sourcePath, targetPath + '/icons/' + icon.fileName);

        if(sourceFileName !== newFileName){
          console.log(`Renamed a duplicate icon file name from ${icon.fileName} to ${newFileName}`);
          // If the file name has been changed during copying, update the icon meta object accordingly.
          let duplicateIcons = [];
          duplicateIcons = this.icons.filter((icon) => {
            if (icon.fileName === sourceFileName){
              return icon;
            }
          });

          // Rename the second instance in this.icons so that the correct name gets written to the meta file
          duplicateIcons[1].fileName = newFileName;

        }

        // console.log(`copied icon from ${this.folder.get_path()}/${icon.fileName} to ${targetPath}/${icon.fileName}`);

      }
    } catch(e) {
      this.throwError('Error copying icon files: ' + e);
    }

    // Prepare the set object which will eventually be saved to meta.json
    set = {
      name: newSetName,
      createdOn: Date.now(),
      icons: this.icons
    }

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
    }

    try {
      // Show the "Completed" state
      this._stack.set_visible_child_name('success');
      this._header_bar.showTitle = false;
      this._header_bar.showStartTitleButtons = true;
      this._header_bar.showEndTitleButtons = true;
      this._success_message.label = `Successfully imported all ${this.icons.length} icons`;
      this.newSetName = set.name;

      // Tell Window.js that a new set was added
      this.emit('set-added', newSetId);

    } catch(e) {
      this.throwError('Error finalising import: ' + e);
    }
  }


  /* Load a directory of icons for import. Called by Window.js to activate this widget.
   * @param {Gio.File} folder - the user-selected folder containing the svg icons to import
   */
  async prepareImport(folder){
    try {

      // Hide the progress bar
      this._prepare_import_progress.visible = false;

      // Update the 'folder' property
      this.folder = folder;
      this.notify('folder');

      // Clear the 'icons' property
      this.icons = [];
      this.notify('icons');

      const svgArray = await this.crawlDirectoryForSVGs(folder);
      this._prepare_import_progress.visible = true;

      // Populate the iconFiles ListStore
      let iconsCount = 0;

      for (const iconPath of svgArray) {

        const gFile = Gio.File.new_for_path(iconPath);
        const info = await gFile.query_info_async('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);

        if (info.get_content_type() === 'image/svg+xml') {

          const iconFilename = info.get_name();
          const folderName = GLib.path_get_dirname(iconPath);

          console.log('getting icon file dimensions');
          const [width, height] = getIconFileDimensions(gFile, false);
          console.log('completed dimensions');

          const style = estimateIconStyle(gFile, folderName);


          const iconMeta = {
            fileName: iconFilename,
            sourcePath: iconPath,
            width,
            height,
            style,
          };

          //console.log(JSON.stringify(iconMeta));

          // Push this to the icon store
          this.icons.push(iconMeta);

          iconsCount++;

          this._prepare_import_progress.fraction = iconsCount / svgArray.length;
        }
      }

      return iconsCount;

    } catch(e) {
      this.throwError('Error preparing for import: ' + e);
      return 0;
    }

  }

  /**
  * Recursively crawl a directory for SVG files
  * @param {Gio.File} rootDir - the directory to scan
  * @return {[string]} - an array of filepaths to SVG files
  **/
  async crawlDirectoryForSVGs(rootDir) {
    const svgFiles = [];

    async function crawl(rootDir) {
        try {
          const enumerator = await rootDir.enumerate_children_async('standard::name,standard::type',
              Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);

          for await (const fileInfo of enumerator) {
              const fileName = fileInfo.get_name();
              const filePath = rootDir.get_child(fileName).get_path();

              if (fileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
                  const subdir = rootDir.get_child(fileName);
                  await crawl(subdir);
              } else if (fileName.toLowerCase().endsWith('.svg')) {
                  svgFiles.push(filePath);
              }
          }
      } catch(e){
        this.throwError('Error crawling directory: ' + e);
        return svgFiles;
      }
    }

    await crawl(rootDir);

    return svgFiles;
}


  onCancelClicked() {
    this._add_set_dialog.close();
  }

  onOpenSet() {
    this._add_set_dialog.close();
    this._appWindow.openStackPage(this.newSetName);
  }

  onStartAgain(){
    this.onBackClicked();
    this._back_button.visible = false;
    this._new_set_name_entry.text = '';
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

  /** Attempts to copy a file from source to target. If there is already a file with that name in the target, rename the file by adding (X) to the end of the filename, where X is the smallest integer that makes up a unique filename.
  * @param {String} sourcePath - the path of the source file to copy
  * @param {String} targetPath - the path to try copying the file to in the first instance
  * @return {String} - the final name of the copied file
  **/
  async copyFileWithRename(sourcePath, targetPath){
    const sourceFile = Gio.File.new_for_path(sourcePath);
    const sourceFileName = sourceFile.get_basename();
    let targetFile = Gio.File.new_for_path(targetPath);
    let i = 0;

    while (true){
      try {
        await sourceFile.copy_async(
          targetFile,
          Gio.FileCopyFlags.NONE,
          GLib.PRIORITY_DEFAULT,
          null,
          null
        );
        return targetFile.get_basename(); // Return the final filename
      } catch (error) {
        if (error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) {
          i++;
          const fileInfo = await targetFile.query_info_async(
            'standard::name',
            Gio.FileQueryInfoFlags.NONE,
            GLib.PRIORITY_DEFAULT,
            null
          );
          const [baseName, extension] = sourceFileName.split(/\.(?=[^.]+$)/);
          const newName = `${baseName}(${i})${extension ? '.' + extension : ''}`;
          targetFile = targetFile.get_parent().get_child(newName);
        } else {
            throw error;
        }
      }
    }
  }

});

