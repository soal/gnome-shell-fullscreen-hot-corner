/*
  Fullscreen Hot Corner Gnome Shell Extension
  Developed by Aleksey Pozharov sorrow.about.alice@pm.me

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program. If not, see
  < https://www.gnu.org/licenses/gpl-3.0.html >.
  This program is a derived work of the Gnome Shell.
*/

const { GObject } = imports.gi;
const Main = imports.ui.main;
const Layout = imports.ui.layout;
const Lang = imports.lang;
const HotCorner = imports.ui.layout.HotCorner
const _origUpdateHotCorners = Main.layoutManager._updateHotCorners;


function _toggleOverview() {
    // adopted from original Gnome Shell code but with fullscreen check removed
    // location: /js/ui/layout.js:1227
    if (Main.overview.shouldToggleByCornerOrButton()) {
        this._ripples.playAnimation(this._x, this._y);
        Main.overview.toggle();
    }
}

function initialize() {
    function _removeHotCorners() {
        this.hotCorners.forEach(corner => {
            if (corner)
                corner.destroy();
        });
        this.hotCorners = [];
    }

    function _updateHotCorners() {
        // adopted from original Gnome Shell code
        // location: /js/ui/layout.js:379
        // destroy old hot corners
        this.hotCorners.forEach(corner => {
            if (corner)
                corner.destroy();
        });
        this.hotCorners = [];

        if (!this._interfaceSettings.get_boolean('enable-hot-corners')) {
            this.emit('hot-corners-changed');
            return;
        }

        let size = this.panelBox.height;

        // build new hot corners
        for (let i = 0; i < this.monitors.length; i++) {
            let monitor = this.monitors[i];
            let cornerX = this._rtl ? monitor.x + monitor.width : monitor.x;
            let cornerY = monitor.y;

            let haveTopLeftCorner = true;

            if (i != this.primaryIndex) {
                // Check if we have a top left (right for RTL) corner.
                // I.e. if there is no monitor directly above or to the left(right)
                let besideX = this._rtl ? monitor.x + 1 : cornerX - 1;
                let besideY = cornerY;
                let aboveX = cornerX;
                let aboveY = cornerY - 1;

                for (let j = 0; j < this.monitors.length; j++) {
                    if (i == j)
                        continue;
                    let otherMonitor = this.monitors[j];
                    if (besideX >= otherMonitor.x &&
                        besideX < otherMonitor.x + otherMonitor.width &&
                        besideY >= otherMonitor.y &&
                        besideY < otherMonitor.y + otherMonitor.height) {
                        haveTopLeftCorner = false;
                        break;
                    }
                    if (aboveX >= otherMonitor.x &&
                        aboveX < otherMonitor.x + otherMonitor.width &&
                        aboveY >= otherMonitor.y &&
                        aboveY < otherMonitor.y + otherMonitor.height) {
                        haveTopLeftCorner = false;
                        break;
                    }
                }
            }

            if (haveTopLeftCorner) {
                // here we monkey-patch _toggleOverview method with our version
                HotCorner.prototype._toggleOverview = _toggleOverview
                let corner = new HotCorner(this, monitor, cornerX, cornerY);
                corner.setBarrierSize(size);
                this.hotCorners.push(corner);
            } else {
                this.hotCorners.push(null);
            }
        }

        this.emit('hot-corners-changed');
    }

    return {
        _removeHotCorners,
        _updateHotCorners
    }
}

const actions = initialize()

function init() {}

function enable() {
    Main.layoutManager._updateHotCorners = actions._updateHotCorners.bind(Main.layoutManager);
    Main.layoutManager._updateHotCorners();
}

function disable() {
    // This restores the original hot corners
    actions._removeHotCorners.call(Main.layoutManager);
    Main.layoutManager._updateHotCorners = _origUpdateHotCorners;
    Main.layoutManager._updateHotCorners();
}
