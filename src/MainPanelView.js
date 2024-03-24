import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const MainPanelView = GObject.registerClass({
  GTypeName: 'IcoMainPanelView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/MainPanelView.ui',
  InternalChildren: ['iconsFlowbox'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.#initializeIcons()
  }

  #initializeIcons() {
    const icons = [128513, 128514, 128515, 128516, 128517, 128518, 128519, 128520, 128521, 128522, 128523, 128524, 128525, 128526];


    icons.forEach(icon => {
      // FlowBoxChild -> GtkBox -> GtkLabel, GtkLabel
       this._iconsFlowbox.append(new Gtk.Label({

          vexpand: true,
          hexpand: true,
          label: String.fromCodePoint(icon),
          css_classes: ["emoji"],
        width_request: 100,
        height_request: 100,
        css_classes: ["card"],
      }))

    });

  }

});
