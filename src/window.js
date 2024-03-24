import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

export const IconManagerWindow = GObject.registerClass({
    GTypeName: 'IconManagerWindow',
    Template: 'resource:///com/github/azuredusk10/IconManager/window.ui',
}, class IconManagerWindow extends Adw.ApplicationWindow {
    constructor(application) {
        super({ application });
    }
});

