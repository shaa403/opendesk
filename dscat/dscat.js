
"use strict";

import output from "./output.js";

const argv = process.argv.slice(2);

function mongo() {}

function unknowndb() {
   console.log("Unknown database : \"%s\".", argv[0]);
   console.log("Dscat does not provide operations for the specified database.");
   output.bold("Did you mean any of the following?", true);
   console.log("\t- mongo"); /* dscat only supports mongo for now */
   return void 0;
}

switch(argv[0]) {
   case "mongo": mongo(); break;
   default: unknowndb();
}
