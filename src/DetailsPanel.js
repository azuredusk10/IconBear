import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';

import { deleteRecursively, drawSvg } from './helperFunctions.js';

Gio._promisify(Gio.File.prototype, 'make_directory_async');

export const DetailsPanel = GObject.registerClass({
  GTypeName: 'IcoDetailsPanel',
  Template: 'resource:///design/chris_wood/IconBear/ui/DetailsPanel.ui',
  Properties: {
    icon: GObject.ParamSpec.object(
      'icon',
      'Icon',
      'The Icon in GObject format',
      GObject.ParamFlags.READWRITE,
      GObject.Object
    ),
    iconLabel: GObject.ParamSpec.string(
      'iconLabel',
      'Icon Label',
      'The icon label',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    iconStyle: GObject.ParamSpec.string(
      'iconStyle',
      'Icon Style',
      'The icon style in readable text',
      GObject.ParamFlags.READWRITE,
      'Unknown'
    ),
    setName: GObject.ParamSpec.string(
      'setName',
      'Set Name',
      'The name of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setId: GObject.ParamSpec.string(
      'setId',
      'Set ID',
      'The id of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setIconsCount: GObject.ParamSpec.int(
      'setIconsCount',
      'Set Icon Count',
      'The number of icons in the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      0, 1000000
    ),
    setLicense: GObject.ParamSpec.string(
      'setLicense',
      'Set licence',
      'The license of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setAuthor: GObject.ParamSpec.string(
      'setAuthor',
      'Set author',
      'The author of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    setWebsite: GObject.ParamSpec.string(
      'setWebsite',
      'Set website',
      'The website of the currently selected icon set',
      GObject.ParamFlags.READWRITE,
      ''
    ),
    iconIsSelected: GObject.ParamSpec.boolean(
      'iconIsSelected',
      'Icon Is Selected',
      'Whether or not an icon is currently selected',
      GObject.ParamFlags.READWRITE,
      false,
    ),
    preferredCopyMethod: GObject.ParamSpec.int(
      'preferredCopyMethod',
      'Preferred Copy Method',
      'The user-defined setting for the default copy method',
      GObject.ParamFlags.READWRITE,
      0, 1,
      0
    ),
  },
  InternalChildren: ['preview_frame', 'preview_image', 'icons_count', 'icon_size_row', 'copy_button', 'copy_button_content'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.connect('notify::icon', () => this.#updateIconDetails());
    this.#bindProperties();
    this.updateSplitButton();
    this.initializeDragSource();
  }

  #updateIconDetails(){

    if(this.icon && this.icon.gfile){

      // Redraw the preview icon
      this._preview_image.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.icon.gfile));

      // Bind the icon label to the icon object's label
      this.iconLabel = this.icon.label

      // Show the "icon selected" view
      this.iconIsSelected = true;

      this._icon_size_row.subtitle = `${this.icon.width} × ${this.icon.height}`;

      // Apply special frame styling in dark mode if the icon is of style 'color'
      if(this.icon.style == 4){
        this._preview_frame.add_css_class('preview-frame--color-icon');
      } else {
        this._preview_frame.remove_css_class('preview-frame--color-icon');
      }

      // Show the correct word for the style
      switch(this.icon.style){
        case 1:
          this.iconStyle = 'Outline';
          break;
        case 2:
          this.iconStyle = 'Filled';
          break;
        case 3:
          this.iconStyle = 'Duotone';
          break;
        case 4:
          this.iconStyle = 'Color';
          break;
        default:
          this.iconStyle = 'Unknown';

      }



    } else {
      // Show the empty state view
      this.iconIsSelected = false;
    }

  }

  #bindProperties(){
    // Appends the word "icons" onto the setIconsCount property and binds it to the label in the empty state
    this.bind_property_full('setIconsCount', this._icons_count, 'label', GObject.BindingFlags.SYNC_CREATE, (binding, value) => [true, value + ' icons'], null);

    // Bind the preferred copy method property to this composite widget
    settings.bind('preferred-copy-method', this, 'preferredCopyMethod', Gio.SettingsBindFlags.DEFAULT);
    this.connect('notify::preferredCopyMethod', () => this.updateSplitButton());

  }

  /*
  onOpenLocation(){
    const location = this.icon.filepath.substring(0, this.icon.filepath.lastIndexOf("/"));

    try {
        Gio.AppInfo.launch_default_for_uri('file:///' + location, null);

    } catch (e) {
        logError(e);
    }


  }
  */

  /**
  * Updates the label, action and menu model of the copy AdwSplitButton to match the preferred copy method setting.
  *
  **/
  updateSplitButton() {
    console.log('updating split button changed');
    let menuModel = new Gio.Menu();

    if(this.preferredCopyMethod === 0){
      // Copy as file is preferred
      this._copy_button_content.label = 'Copy SVG file';
      menuModel.append("Copy SVG code", "set-view.copy(1)");

    } else {
      // Copy as code is preferred
      this._copy_button_content.label = 'Copy SVG code';
      menuModel.append("Copy SVG file", "set-view.copy(0)");
    }

    this._copy_button.set_menu_model(menuModel);
  }

  initializeDragSource(){
    const dragSource = new Gtk.DragSource({
      actions: Gdk.DragAction.MOVE,
    });
    this._preview_frame.add_controller(dragSource);


    let drag_x;
    let drag_y;

    dragSource.connect("prepare", (_source, x, y) => {

    drag_x = x;
    drag_y = y;

     const method = settings.get_int('preferred-copy-method');

      const dataDir = GLib.get_user_data_dir();
      const gfile = this.icon.gfile;

      const tempPath = GLib.build_filenamev([dataDir, 'temp']);
      const tempFolder = Gio.File.new_for_path(tempPath);
      if (tempFolder.query_exists(null)){
        // If the "temp" folder already exists, delete the temporary files inside it
        console.log('clearing contents of temp folder');
        deleteRecursively(tempPath, false);
      } else {
        // Otherwise, create the "temp" folder
        console.log('creating temp folder');
        tempFolder.make_directory(null);
      }


      // Open the resource for reading
      const [, fileContents] = gfile.load_contents(null);
      const stringContents = new TextDecoder().decode(fileContents);

      /* 1: Create the plain text content provider */

      // Create a GValue of type string, containing the file's contents
      const textValue = new GObject.Value();
      textValue.init(GObject.TYPE_STRING);
      textValue.set_string(stringContents);

      // Create the string content provider
      const contentProviderString = Gdk.ContentProvider.new_for_value(textValue);


      /* 2: Create the file content provider */

      // Convert any em/rem units in the file to pixels. This ensures the size is correctly set in design software. Otherwise, icons are pasted at 12px.
      const strippedEmRemUnits = stringContents.replaceAll(/1em|1rem/gi, '16px').replaceAll(/2em|2rem/gi, '32px').replaceAll(/3em|3rem/gi, '48px').replaceAll(/4em|4rem/gi, '64px');

      // Create a temporary file with the new contents
      const tempFile = Gio.File.new_for_path(GLib.build_filenamev([tempPath, gfile.get_basename()]));
      tempFile.replace_contents(strippedEmRemUnits, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);

      // Create a new GValue with the temp file as its content
      const fileValue = new GObject.Value();
      fileValue.init(Gio.File);
      fileValue.set_object(tempFile);

      // Create the file content provider
      const contentProviderFile = Gdk.ContentProvider.new_for_value(fileValue);

      if(method === 0){
       return contentProviderFile;
      } else if(method === 1){
        return contentProviderString;
      }
    });

    dragSource.connect("drag-begin", (_source, drag) => {
      const dragWidget = new Gtk.DrawingArea();

      dragWidget.set_size_request(this.icon.width, this.icon.height);
      dragWidget.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, this.icon.gfile));

      const dragIcon = Gtk.DragIcon.get_for_drag(drag);
      dragIcon.child = dragWidget;

      drag.set_hotspot(drag_x, drag_y);
    });

    // Change the cursor while it's over the drag source
    const motionController = new Gtk.EventControllerMotion();
    motionController.connect('enter', () => this._onCursorEnter());
    motionController.connect('leave', () => this._onCursorLeave());
    this._preview_frame.add_controller(motionController);
  }

  _onCursorEnter(controller) {
        // Change cursor to open hand when entering the drag zone
        const handCursor = Gdk.Cursor.new_from_name('grab', null);
        this.set_cursor(handCursor);
    }

    _onCursorLeave(controller) {
        // Reset cursor to default when leaving the drag zone
        this.set_cursor(null);
    }

});
