import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Rsvg from 'gi://Rsvg';

export const IconPaintable = GObject.registerClass({
  GTypeName: 'IcoIconPaintable',
  Extends: [Gtk.Paintable],
  Properties: {
    Filepath: GObject.ParamSpec.string(
      'filepath',
      'Filepath',
      'The filepath to the icon image to be displayed',
      GObject.ParamFlags.READWRITE,
      ''
    ),
  },
}, class extends Gtk.Widget {

  constructor(params){
    super(params);

  }


  vfunc_snapshot(snapshot, width, height) {
    // Create a Cairo context
    const cairoContext = snapshot.cairoContext;

    // Load an svg file using the "Filename" property
    const svgFile = Gio.File.new_for_path(this.filepath);

    // Create an Rsvg handle
    const rsvgHandle = Rsvg.Handle.new_from_gfile_sync(svgFile, 0, null);

    // Set the viewport width and height
    const viewport = new Rsvg.Rectangle({
      x: 0,
      y: 0,
      width: 24,
      height: 24
    });

    // Render the SVG to the Cairo context
    rsvgHandle.render_document(cairoContext, viewport);

    // Clean up
    rsvgHandle.close();
  }

  get_intrinsic_width() {
    // SVG output width
    return 24;
  }

  get_intrinsic_height() {
    // SVG output height
    return 24;
  }

});
