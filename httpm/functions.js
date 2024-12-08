
"use strict";

import { existsSync, closeSync, openSync, mkdirSync, readFileSync, writeSync } from "node:fs";
import { isURL } from "./httpm.js";
import { request as httprequest, METHODS } from "node:http";
import { request as httpsrequest } from "node:https";
import supportsAnsi from "./supportsAnsi.js";

const ansiIsSupported = supportsAnsi();
const ansi = {     
   bold: ansiIsSupported ? "\x1b[1m" : "",
   dim: ansiIsSupported ? "\x1b[2m" : "",
   green: ansiIsSupported ? "\x1b[92m" : "",
   reset: ansiIsSupported ? "\x1b[0m" : ""
}
const NO_REQ_ENTITY_METHODS = ["GET", "HEAD", "DELETE", "OPTIONS"];

/* return null if the file does not exist  */
function readfile(path) {
   try { return readFileSync(path) }
   catch(_) { return null }
}

function http_send(reqparam) {
   const sock_params = [
      reqparam.url,
      {
         insecureHTTPHeaders: true, /* This lib is simply a mirror */
         headers: reqparam.headers,
         method: reqparam.method,
      },
      response => {
         const headers = response.headers;
         /* not exactly how http response/status line should be, but for the sake of this project: */
         console.log(" %s %s %s", response.statusCode, response.statusMessage, reqparam.url);
         Object.entries(headers).forEach(field => {
            if (Array.isArray(field[1])) field[1] = field[1].join(", ");
            console.log(" %s%s%s : %s%s%s", ansi.green, field[0], ansi.reset, ansi.dim, field[1], ansi.reset);
         }); 
         console.log();

         const contentlen = headers["content-length"] || 0;
         const is_printable_payload = 
            (!headers["accept-encoding"] || headers["accept-encoding"] === "identity") &&   
            [
               "text/plain",  "text/html", "application/json", "text/css", "application/javascript",
               "text/xml", "application/xml", "text/markdown", "text/csv", "text/rtf"
            ].find(mime => headers["content-type"]?.startsWith(mime)) ? true : false;
         let fd;
         
         if (is_printable_payload && contentlen !== 0) 
            response.setEncoding("utf-8");
         else if (!is_printable_payload && contentlen > 0) {
            if (!existsSync("httpm")) mkdirSync("httpm");
            let id = new URL(reqparam.url);
            id = "httpm/" + id.hostname + id.pathname.split("/").join("-");           
            fd = openSync(id, "a");
            /* errors are not handled on purpose, as httpm itself is a fan of crashing processes if a file can't be opened. 
               this encourages the user to retry as the payload is considered one of the MOST important thing
               in the response.
            */
            console.log("Redirecting payload to /%s", id);
         } else null;

         response.on("data", chunk => is_printable_payload ? 
            process.stdout.write(chunk) :
            writeSync(fd, chunk)
         );
            
         response.on("end", ()=> {
            if (fd) closeSync(fd);
            console.log("\n------------------------------------------\n");
         });
      }
   ];

   const request = reqparam.url.startsWith("https") ? httpsrequest(...sock_params) : httprequest(...sock_params);
   if (reqparam.body) 
      /* if a file named [request.body] exists: write it's content, else write [request.body] */
      request.write(readfile(reqparam.body) || reqparam.body);
   request.on("error", error => console.log("Request failed: %s%s%s", ansi.dim, error.message, ansi.reset));
   request.end();	
}

export function home() {
   console.log("Welcome to httpm");
}

export function req_fs(path, argv) {
   try {
      let tree = [];
      let pcursor = -1;
      let blocks = readFileSync(path, "utf-8").trim().split("http::end");

      for (let i = 0; i < blocks.length; ++i) {
         let block = blocks[i].trim().split("\n");

         for (let n = 0; n < block.length; ++n) {
            let line = block[n];
            if (n === 0) {
               line = line.trim().split(" ");   
           	   if (METHODS.includes(line[0]) && isURL(line[1] || null)) {
         	      tree.push({ method: line[0], url: line[1] });
           	      ++pcursor;
          	   } else 
          	      throw new Error(`Invalid "request line" at request block ${i}`);
            } else if (n === 1) {
               tree[pcursor].headers = {};	
            } else {
               if (line === "" && !NO_REQ_ENTITY_METHODS.includes(tree[pcursor].method)) {
                  tree[pcursor].headers_write_end = true;
                  tree[pcursor].body = [];
               } else if (line === "" && NO_REQ_ENTITY_METHODS.includes(tree[pcursor].method))
                  break;
               else null;
                                 
               if (!tree[pcursor].headers_write_end) {
                  line = line.split(":").map(chars => chars.trim());       
                  if (line[0] && line[1])
                     tree[pcursor].headers[line[0]] = line[1];
               } else
                  if (line !== "") tree[pcursor].body.push(line);
            }
         }
         delete tree[pcursor].headers_write_end;
         if (tree[pcursor].body) tree[pcursor].body = tree[pcursor].body.join("\n");
      }

      let treeindex = argv.find(arg => arg !== "--trace" && /^[0-9]+$/.test(arg)); 
      if (treeindex && (treeindex === "0" || treeindex > (tree.length))) 
         throw new Error("Out of boundary");
      else if (treeindex)
         tree = [tree[treeindex - 1]];      	
      else null;

      if (!argv.includes("--trace"))
         for (treeindex = 0; treeindex < tree.length; ++treeindex)
           http_send(tree[treeindex]);        
      else {
         console.log(
            "\n%s%sInterpreted version of%s %s%s [%s]%s\n", 
            ansi.bold, 
            ansi.green, 
            ansi.reset, 
            ansi.dim,
            path, 
            treeindex || "",
            ansi.reset
         );
         console.log(JSON.stringify(tree, null, 3));
      }
   } catch(error) {
      const tab = "    ";
      console.log(" %sPanic:%s", ansi.bold, ansi.reset);
      console.log("%s%s%s%s", tab, ansi.dim, error.message, ansi.reset);
      console.log("%s^^^^^^^", tab);
      process.exit(1);
   }
}

/**
 * Problem with simple httpm requests is: headers are not that flexible, for example, a header value cannot contain ","
 * as the parser would count any character after "," as a new header.
 * That been said, simple httpm requests allows simple http headers.
 * 
 * full structure: 
 * `<command> <url> -M <method> -H <headers> -B <path_to_payload>`
 */
export function req_url(url, argv) {
   console.log();
   const construct = { url };

   function transform_header(strs) {
      const headers = {};
      strs.split(",").filter(chars => !/^\s+$/.test(chars)).
      forEach(fields => {
         fields = fields.split(":");
         if (fields[0] && fields[1])
            headers[fields[0].trim()] = fields[1].trim();
      });
      return headers;      
   }  

   // js is such a good language: it does not throw "out of boundary" error, when one tries to access an element whose index is > arrlen
   if (!METHODS.includes(construct["method"] = argv[argv.findIndex(str => str.toUpperCase() === "-M") + 1]?.toUpperCase()))
      construct["method"] = "GET";
   if (!(construct["headers"] = argv[argv.findIndex(str => str.toUpperCase() === "-H") + 1]))
       construct["headers"] = "";            

   construct.headers = transform_header(construct.headers);

   if (
      !NO_REQ_ENTITY_METHODS.includes(construct.method) && 
      (argv.includes("-B") || argv.includes("-b"))
   ) {
      const argi = argv.findIndex(str => str.toUpperCase() === "-B") + 1;
      if (argi < argv.length && !argv[argi].startsWith("-"))
         construct.body = argv[argi];
   }
 
   http_send(construct);  
}
