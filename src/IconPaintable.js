import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Rsvg from 'gi://Rsvg';

export const IconPaintable = GObject.registerClass({
  GTypeName: 'IcoIconPaintable',
  Implements: [Gdk.Paintable],
  Properties: {
    Filepath: GObject.ParamSpec.string(
      'filepath',
      'Filepath',
      'The filepath to the icon image to be displayed',
      GObject.ParamFlags.READWRITE,
      ''
    ),
  },
}, class extends GObject.Object {

  constructor(params){
    super(params);

  }


  vfunc_snapshot(snapshot, width, height) {
    // TODO: The render_document method is breaking the app.
    // Create a Cairo context
    const cairoContext = snapshot.cairoContext;

    // Load an svg file using the "Filename" property
    const svgFile = Gio.File.new_for_path(this.filepath);

    // Create an Rsvg handle
    const rsvgHandle = Rsvg.Handle.new_from_gfile_sync(svgFile, 0, null);
    // const rsvgHandle = Rsvg.Handle.new_from_file(this.filepath);

    // Set the viewport width and height
    const viewport = new Rsvg.Rectangle({
      x: 0,
      y: 0,
      width: 24,
      height: 24
    });

    //rsvgHandle.render_document(cairoContext, viewport);

  }

  vfunc_get_intrinsic_width() {
    // SVG output width
    return 24;
  }

  vfunc_get_intrinsic_height() {
    // SVG output height
    return 24;
  }

  vfunc_get_flags(){

    // This flag states that the content will not change, for optimisation.
    return Gdk.PaintableFlags.CONTENTS;
  }

});
