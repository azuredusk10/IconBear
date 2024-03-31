import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const IconSetStackView = GObject.registerClass({
  GTypeName: 'IcoIconSetStackView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/IconSetStackView.ui',
  Properties: {

  },
  InternalChildren: ['main_panel', 'toast_overlay', 'details_panel'],
}, class extends Gtk.Widget {
  constructor(params){
    super(params);
  }

  onIconActivated(emitter, filepath, label){
	  this._details_panel.filepath = filepath;
	  this._details_panel.label = label;
	}

});
