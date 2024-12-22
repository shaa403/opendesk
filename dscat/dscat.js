
"use strict";

import ds_mongo from "./datastore/mongo.js";
import output from "./output.js";

const argv = process.argv.slice(2);

function mongo() {
   switch (argv[1]) {
      case "addconn": ds_mongo.addconn(); break;
      case "connect": ; break;
      case "list": ; break;
      case "removeconn": ; break;
      default:ds_mongo.unknowncmd(argv[1]);	
   } 
}

function unknowndb() {
   console.log(`Unknown database : "${argv[0] || ""}".`);
   console.log("Dscat does not provide operations for the specified database.");
   output.bold("Did you mean any of the following?", true);
   console.log("\t- mongo"); /* dscat only supports mongo for now */
}

switch(argv[0]) {
   case "mongo": mongo(); break;
   default: unknowndb();
}
