import Gio from 'gi://Gio';
import Rsvg from 'gi://Rsvg';

export const drawSvg = (widget, cr, width, height, gfile) => {

    // Create an Rsvg handle
    const rsvgHandle = Rsvg.Handle.new_from_gfile_sync(gfile, 0, null);

    // const width = widget.get_allocated_width();
    // const height = widget.get_allocated_height();

    // Set the viewport width and height
    const viewport = new Rsvg.Rectangle({
      x: 0,
      y: 0,
      width,
      height,
    });

    // Render the SVG
    return rsvgHandle.render_document(cr, viewport);
  };
