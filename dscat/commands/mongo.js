
"use strict";

import * as readline from "node:readline";
import createWindow from "../window.js";
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

function addconn() {
   const stdout = readline.createInterface({ 
      input: process.stdin, 
      output: process.stdout 
   });
   let connstring = null;
   let isworking = false;
   stdout.setPrompt("Enter your MongoDB connection string: ");
   stdout.on("line", async (text)=> {
      if (!isworking) {
         try {
            isworking = true;
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
               if (text) {
       	          const store = fsapi.get(); 
       	          const existing_connstring = Object.entries(store).find(cred => cred[1].connstring === connstring);
       	          if (!existing_connstring) {
       	             store[text] = { connstring, lu: Date.now() };
       	             fsapi.set(store);
                     stdout.write("\x1b[2J\x1b[3J\x1b[0;0H");
                     stdout.close();
                  } else throw new Error(`connection string already exist as "${existing_connstring[0]}"`);
               } else stdout.prompt();
            }
            isworking = false;
         } catch(error) {
      	   console.log("\n" + error.message);
      	   stdout.close();
      	   process.exit(1);
         }
      }
   });
   stdout.prompt();
}

function connect(keyname) {
   createWindow();
}

function list(showall) {
   const credentials = fsapi.get();
   if (showall)
      Object.entries(credentials).forEach(entry => {
         process.stdout.write("\n");
         output.bold(" " + entry[0] + ` [${new Date(entry[1].lu).toUTCString()}] `);
         process.stdout.write(entry[1].connstring + "\n");
      });	
   else
      Object.keys(credentials).forEach((entry, index) => {
         output.dim("   #" + (index + 1));
         process.stdout.write(" " + entry + "\n");
      });
}

function removeconn(names) {
   const credentials = fsapi.get();
   names.forEach(name => delete credentials[name]);
   fsapi.set(credentials);
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

const cmd_mongo = {
   addconn,
   connect,
   list,
   removeconn,
   unknowncmd
}

export default cmd_mongo;
