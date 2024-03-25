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
    const icons = ['ico-grid-large-symbolic', 'ico-grid-large-symbolic', 'ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic','ico-grid-large-symbolic'];


    icons.forEach(icon => {
      // FlowBoxChild -> GtkBox -> GtkLabel, GtkLabel
      const newItem = new Gtk.Box({
        css_classes: ["card", "card--icon"],
        spacing: 4,
        orientation: 1,
      });

      newItem.append(new Gtk.Image({
          vexpand: true,
          hexpand: true,
          icon_name: icon,
          css_classes: ["emoji"],
          pixel_size: 24,
          margin_top: 16,
          margin_bottom: 16,
      }));

      newItem.append(new Gtk.Label({
          vexpand: true,
          label: 'icon label',
          css_classes: ["icon-label"],
          width_request: 100,
      }));

      const newItemWrapper = new Gtk.FlowBoxChild({
        child: newItem,
      });

      this._iconsFlowbox.append(newItemWrapper);

    });

  }

  onIconActivated(child) {
    console.log('activated!')

    // Open the details panel
  }

});
