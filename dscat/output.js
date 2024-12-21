
"use strict";

const output = {
   bold: (text, br) =>
      process.stdout.write("\x1b[1m" + text + "\x1b[0m" + (br ? "\n" : ""))
}

export default output;
