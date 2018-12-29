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

const Main = imports.ui.main;
const Layout = imports.ui.layout;
const Lang = imports.lang;
const _origUpdateHotCorners = Main.layoutManager._updateHotCorners;

const FullscreenHotCorner = new Lang.Class({
    Name: "FullscreenHotCorner",
    Extends: Layout.HotCorner,

    _toggleOverview() {
        if (Main.overview.shouldToggleByCornerOrButton()) {
            this._rippleAnimation();
            Main.overview.toggle();
        }
    }
});

function init() {}

function _removeHotCorners() {
    Main.layoutManager.hotCorners.forEach(corner => {
        if (corner) corner.destroy();
    });
    Main.layoutManager.hotCorners = [];
}

function _updateHotCorners() {
    // destroy old hot corners
    _removeHotCorners();

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
                if (i == j) continue;
                let otherMonitor = this.monitors[j];
                if (
                    besideX >= otherMonitor.x &&
                    besideX < otherMonitor.x + otherMonitor.width &&
                    besideY >= otherMonitor.y &&
                    besideY < otherMonitor.y + otherMonitor.height
                ) {
                    haveTopLeftCorner = false;
                    break;
                }
                if (
                    aboveX >= otherMonitor.x &&
                    aboveX < otherMonitor.x + otherMonitor.width &&
                    aboveY >= otherMonitor.y &&
                    aboveY < otherMonitor.y + otherMonitor.height
                ) {
                    haveTopLeftCorner = false;
                    break;
                }
            }
        }

        if (haveTopLeftCorner) {
            let corner = new FullscreenHotCorner(
                this,
                monitor,
                cornerX,
                cornerY
            );
            corner.setBarrierSize(size);
            this.hotCorners.push(corner);
        } else {
            this.hotCorners.push(null);
        }
    }

    this.emit("hot-corners-changed");
}

function enable() {
    Main.layoutManager._updateHotCorners = _updateHotCorners;
    Main.layoutManager._updateHotCorners();
}

function disable() {
    // This restores the original hot corners
    _removeHotCorners();
    Main.layoutManager._updateHotCorners = _origUpdateHotCorners;
    Main.layoutManager._updateHotCorners();
}
