import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Icon } from './Icon.js';
import { drawSvg } from './drawSvg.js';

export const AllSetsStackView = GObject.registerClass({
  GTypeName: 'IcoAllSetsStackView',
  Template: 'resource:///com/github/azuredusk10/IconManager/ui/AllSetsStackView.ui',
  InternalChildren: ['sets_flowbox'],
  Properties: {
    searchEntryText: GObject.ParamSpec.string(
      'searchEntryText',
      'Search Entry Text',
      'The user-inputted value of the search entry',
      GObject.ParamFlags.READWRITE,
      ''
    ),
  },
  Signals: {
    'set-activated': {
      param_types: [GObject.TYPE_STRING]
    },
  }
}, class extends Gtk.Widget {
  constructor(params){
    super(params);

    // May need to call this once the icon sets have been loaded in correctly via properties
    this.#initializeFlowbox();
  }

  #initializeFlowbox(){
    const sets = [{
      label: 'Carbon',
      iconCount: 2552,
      iconFilepaths: [
        '/home/chriswood/icon-sets/carbon/3d-cursor.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor-alt.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-colon.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-vessels.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-manual.svg',
        '/home/chriswood/icon-sets/carbon/3d-ica.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor-alt.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-colon.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-vessels.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-manual.svg',
        '/home/chriswood/icon-sets/carbon/3d-ica.svg',
      ]
    }, {
      label: 'Carbon 2',
      iconCount: 2553,
      iconFilepaths: [
        '/home/chriswood/icon-sets/carbon/3d-cursor.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor-alt.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-colon.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-vessels.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-manual.svg',
        '/home/chriswood/icon-sets/carbon/3d-ica.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor-alt.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-colon.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-vessels.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-manual.svg',
        '/home/chriswood/icon-sets/carbon/3d-ica.svg',
      ]
    }, {
      label: 'Carbon 3',
      iconCount: 2554,
      iconFilepaths: [
        '/home/chriswood/icon-sets/carbon/3d-cursor.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor-alt.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-colon.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-vessels.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-manual.svg',
        '/home/chriswood/icon-sets/carbon/3d-ica.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor.svg',
        '/home/chriswood/icon-sets/carbon/3d-cursor-alt.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-colon.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-auto-vessels.svg',
        '/home/chriswood/icon-sets/carbon/3d-curve-manual.svg',
        '/home/chriswood/icon-sets/carbon/3d-ica.svg',
      ]
    }];

    sets.forEach(set => {

      // FlowBoxChild -> Box -> (FlowBox -> FlowBoxChild -> DrawingArea * 6), (Box -> (Label, Label))

      const setTile = new Gtk.Box({
        orientation: 1,
        hexpand: true,
      });

      const setTilePreviewFlowBox = new Gtk.FlowBox({
        sensitive: false,
        minChildrenPerLine: 3,
        maxChildrenPerLine: 6,
      });

      set.iconFilepaths.forEach(filepath => {

        const svgWidget = new Gtk.DrawingArea({
          widthRequest: 24,
          heightRequest: 24,
          marginTop: 8,
          marginBottom: 8,
          cssClasses: ['icon-grid__image'],
        })

        svgWidget.set_draw_func((widget, cr, width, height) => drawSvg(widget, cr, width, height, filepath));

        setTilePreviewFlowBox.append(svgWidget);

      });

      const setLabel = new Gtk.Label({
        label: set.label,
        cssClasses: ['title-3'],
        hexpand: true,
        halign: 1,
      });

      const setIconCount = new Gtk.Label({
        label: set.iconCount.toString(),
        opacity: 0.7,
        halign: 2,
      });

      const setTileTextBox = new Gtk.Box({
        spacing: 8,
        hexpand: true,
        marginStart: 8,
        marginEnd: 8,
        marginTop: 8,
        marginBottom: 8,
      });

      setTileTextBox.append(setLabel);
      setTileTextBox.append(setIconCount);

      setTile.append(setTilePreviewFlowBox);
      setTile.append(setTileTextBox);

      const setFlowBoxChild = new Gtk.FlowBoxChild({
        child: setTile,
        name: set.label,
        cssClasses: ['card'],
      });

      this._sets_flowbox.append(setFlowBoxChild);
    });

  }

  onSetActivated(_flowbox, _child){
    this.emit('set-activated', _child.name);
    _flowbox.unselect_all();
  }

});
