import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const DetailsPanel = GObject.registerClass({
  GTypeName: 'IcoDetailsPanel',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/DetailsPanel.ui',
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

  }


});
