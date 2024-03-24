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
      const newItem = new Gtk.Box({
        css_classes: ["card", "card--icon"],
        spacing: 4,
        orientation: 1,
      });

      newItem.append(new Gtk.Label({
          vexpand: true,
          hexpand: true,
          label: String.fromCodePoint(icon),
          css_classes: ["emoji"],
          width_request: 60,
          height_request: 60,
      }));

      newItem.append(new Gtk.Label({
          vexpand: true,
          label: 'icon label',
          css_classes: ["icon-label"],
          width_request: 100,
      }));



      this._iconsFlowbox.append(newItem);

    });

  }

});
