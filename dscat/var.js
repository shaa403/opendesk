
"use strict";

import { homedir, platform } from "node:os";
import { join } from "node:path";

let rooturi = [homedir()];
switch(platform()) {
   case "linux": case "freebsd": case "openbsd": case "android":
      rooturi.push(".config"); break;
}
rooturi = join(...rooturi, ".dscat");

export const uri_credentials = join(rooturi, ".credentials");
