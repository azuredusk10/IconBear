import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const MainPanelView = GObject.registerClass({
  GTypeName: 'IcoSidebarView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/SidebarView.ui',
  InternalChildren: ['main_stack_sidebar'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
    this.#initializeSets();

  }

  #initializeSets() {

  /*
    const sets = ['Set 1', 'Another set name', 'Set 3', 'Set 4b'];

    sets.forEach(set => {
      // GtkListBox -> GtkListBoxRow -> GtkLabel
      const setRowBox = new Gtk.Box({});
      setRowBox.append(new Gtk.Label({
        label: set,
        halign: 1,
        hexpand: 1
      }));
      setRowBox.append(new Gtk.Label({
        label: '52',
      }));

      const setRow = new Gtk.ListBoxRow({
        child: setRowBox,
        css_classes: [""],
      });

      this._iconSetsList.append(setRow)
    })
    */

  }

});
