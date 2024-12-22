
"use strict";

import * as readline from "node:readline";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import output from "../output.js";
import { uri_credentials as uri_cred_hidden } from "../var.js";

const uri_credentials = join(uri_cred_hidden, "mongo");

/* dscat mongo will reset stored credentials if the credentials store becomes corrupted */
const fsapi = {
   get: _ => {
      try {
         return JSON.parse(readFileSync(uri_credentials, "ascii"));
      } catch(_) { return {}; }
   },
   set: data => {
      const parent = dirname(uri_credentials);
      if (!existsSync(parent))
         mkdirSync(parent, { recursive: true });
      writeFileSync(uri_credentials, JSON.stringify(data));
   }
}

async function addconn() {
   const stdout = readline.createInterface({ 
      input: process.stdin, 
      output: process.stdout 
   });
   let connstring = null;
   stdout.setPrompt("Enter your MongoDB connection string: ");
   stdout.on("line", async (text)=> {
      let mclient;
      if (!connstring) {
         if (
            /^\s*$/.test(text) ||
            !await (mclient = new MongoClient(text))?.connect()
         ) stdout.prompt(); /* will not execute if the second condition ISTRUE, i'll let mongo throw the err */
         else {
            await mclient.close();            
            connstring = text;
            stdout.setPrompt("Enter a memorable name to identify this cluster : ");
            stdout.prompt();
         }
      } else {
       	 const store = fsapi.get();
       	 const existing_record = Object.entries(store).find(cred => cred[1].connstring === connstring);
       	 if (existing_record)
       	    delete store[existing_record[0]];
       	 store[text] = { connstring, lu: Date.now() };
       	 fsapi.set(store);
         stdout.close();
         process.stdout.write("\x1b[2J\x1b[3J\x1b[0;0H");
      }
   });
   stdout.prompt();
}

function unknowncmd(command) {
   console.log(`Unknown command : "${command || ""}".`);
   output.bold("Did you mean any of the following?", true);
   [
      "addconn",
      "connect",
      "list",
      "removeconn"	
   ].forEach(cmd => console.log("\t%s", cmd));
}

const ds_mongo = {
   addconn,
   unknowncmd
}

export default ds_mongo;
