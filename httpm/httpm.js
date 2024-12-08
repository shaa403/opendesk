#!/usr/bin/env node
 
"use strict";

import { home, req_fs, req_url } from "./functions.js";
import { join } from "node:path";
import { statSync } from "node:fs";

function fileExists(path) {
   try {
      if (statSync(path).isFile()) return true;
      else throw new Error("enoent");
   } catch(_) { return false }
}

export function isURL(url) {
   try { new URL(url); return true } 
   catch(_) { return false }
}

let command = process.argv[2];
const argv = process.argv.slice(3);

if (command && isURL(command)) 
   req_url(command, argv);
else if (command && fileExists(command) && [0,1,2].includes(argv.length))
   req_fs(command, argv);
else 
   home();
