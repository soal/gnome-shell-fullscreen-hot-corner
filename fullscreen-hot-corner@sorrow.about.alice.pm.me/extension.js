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

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { HotCorner } from "resource:///org/gnome/shell/ui/layout.js";
const _origToggleOverview = HotCorner.prototype._toggleOverview;

function _toggleOverview() {
    // adopted from original Gnome Shell code but with fullscreen check removed
    // location: /js/ui/layout.js:1268
    if (Main.overview.shouldToggleByCornerOrButton()) {
        Main.overview.toggle();
        if (Main.overview.animationInProgress)
            this._ripples.playAnimation(this._x, this._y);
    }
}

export default class FullscreenHotCornerExtension {
    enable() {
        HotCorner.prototype._toggleOverview = _toggleOverview;
        Main.layoutManager._updateHotCorners();
    }

    disable() {
        HotCorner.prototype._toggleOverview = _origToggleOverview;
        Main.layoutManager._updateHotCorners();
    }
}
