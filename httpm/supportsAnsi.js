/* Credits to: https://github.com/keqingrong/supports-ansi */

"use strict";

import { release } from "node:os";

/**
 * A function that returns `true` if Ansi escape codes are supported in the terminal.
 * This function is a streamlined version of keqingrong's `supports-ansi` library.
 
 * @returns {boolean}
 */
export default function supportsAnsi() {
   const env = process.env;
   if (!process.stdout.isTTY) return false;
   if (process.platform === "win32") {
      const osRelease = release().split(".");
      if (parseInt(osRelease[0], 10) >= 10 && parseInt(osRelease[2], 10) >= 14393) return true;
   }
   const pattern = [
      "^xterm",  "^rxvt", "^eterm", "^screen", "^tmux", "^vt100", "^vt102", "^vt220", "^vt320",
       "ansi", "scoansi", "cygwin", "linux", "konsole", "bvterm"
   ].join("|");
   const regex = new RegExp(pattern, "i");
   if (env?.TERM && env.TERM !== "dumb" && regex.test(env.TERM)) return true;
   const isConEmuAnsiOn = (env.ConEmuANSI || "").toLowerCase() === "on";
   if (isConEmuAnsiOn) return true;
   if (!!env.ANSICON) return true;
   return false;
}
