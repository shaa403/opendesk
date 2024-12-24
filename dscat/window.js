
"use strict";

import * as readline from "node:readline";

// let inputbuffer = [];
// const outputbuffer = [
//    "name: david",
//    "age: 1000",
//    "isLoggedIn: True",
//    "gender: M",
// ];
// let page = 0;
// let outcursor = 0;
// 
// function paint() {
//    let page_w;
//    page_w  = outputbuffer > (page_w === windowsize[1] - 2) ? page_w : outputbuffer.length ;
// 
//    if (outcursor !== page_w)
//       for (let i = 0; i < page_w; ++i) {
//          process.stdout.write(outputbuffer[i] + "\n");
//          ++outcursor;
//       }
// }
// 
// process.stdout.on("resize", ()=> {
//    windowsize = process.stdout.getWindowSize();
//    setscreen(false);
// });
// 
// process.stdin.on("keypress", (char, meta)=> {
//    if (meta.sequence === '\r') {
//      // if (inputbuffer.length === 0) {
//          // render screen
//          //process.stdout.write(`\x1b[2;${inputbuffer.length + 1}H`);
//       //} else {
//          paint();
//          // process command,
//          // clear query,
//          // render screen
//       //}
//    } else {
//       process.stdout.clearLine(0);
//       process.stdout.write("\x1b[2;0H");
//       if (meta.sequence === '\x7F')
//          inputbuffer.pop();
//       else 
//          inputbuffer.push(meta.sequence);
//       process.stdout.write(inputbuffer.join(''));
//    }
// });
// 
// setscreen(true);
// 

function draw_footer(width, db, name) {
   let footer = "";
   footer += `\x1b[30;102m ${db} ${name} \x1b[0m\x1b[100m`;
   width -= (db.length + name.length + 3);
   for (let i = 0; i < width; ++i) 
      footer += " ";
   return footer + "\x1b[0m";
}

function paint(window, windowheight, trigger_fullscreen_paint) {
   if (trigger_fullscreen_paint) {
      process.stdout.write(`\x1b[2J\x1b[3J\x1b[${windowheight};0H`);
      window.prompt();
   }
	
/* else {
//       process.stdout.write(`\x1b[2;0H\x1b[J`);
//       process.stdout.write(inputbuffer.join(""));
//
//    }	*/
}

export default function createWindow() {
   let windowsize = process.stdout.getWindowSize();	
   const window = readline.createInterface({
      input: process.stdin,
      output: process.stdout
   });
   window.setPrompt(draw_footer(windowsize[0], "Mongo", "Netcat"));
   paint(window, windowsize[1] - 2, true);
}
