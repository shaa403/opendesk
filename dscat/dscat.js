
"use strict";

import cmd_mongo from "./commands/mongo.js";
import output from "./output.js";

const argv = process.argv.slice(2);

function mongo() {
   switch (argv[1]) {
      case "addconn": cmd_mongo.addconn(); break;
      case "connect": cmd_mongo.connect(argv[2]); break;
      case "list": cmd_mongo.list(argv.find(flag => flag === "-a")); break;
      case "removeconn": cmd_mongo.removeconn(argv.slice(2)); break;
      default:cmd_mongo.unknowncmd(argv[1]);	
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
