
"use strict";

import * as readline from "node:readline";

// // // let inputbuffer = [];
// // // const outputbuffer = [
// // //    "name: david",
// // //    "age: 1000",
// // //    "isLoggedIn: True",
// // //    "gender: M",
// // // ];
// // // let page = 0;
// // // let outcursor = 0;
// // //
// // // function paint() {
// // //    let page_w;
// // //    page_w  = outputbuffer > (page_w === windowsize[1] - 2) ? page_w : outputbuffer.length ;
// // //
// // //    if (outcursor !== page_w)
// // //       for (let i = 0; i < page_w; ++i) {
// // //          process.stdout.write(outputbuffer[i] + "\n");
// // //          ++outcursor;
// // //       }
// // // }
// // //
// // // process.stdout.on("resize", ()=> {
// // //    windowsize = process.stdout.getWindowSize();
// // //    setscreen(false);
// // // });
// // //
// // // process.stdin.on("keypress", (char, meta)=> {
// // //    if (meta.sequence === '\r') {
// // //      // if (inputbuffer.length === 0) {
// // //          // render screen
// // //          //process.stdout.write(`\x1b[2;${inputbuffer.length + 1}H`);
// // //       //} else {
// // //          paint();
// // //          // process command,
// // //          // clear query,
// // //          // render screen
// // //       //}
// // //    } else {
// // //       process.stdout.clearLine(0);
// // //       process.stdout.write("\x1b[2;0H");
// // //       if (meta.sequence === '\x7F')
// // //          inputbuffer.pop();
// // //       else
// // //          inputbuffer.push(meta.sequence);
// // //       process.stdout.write(inputbuffer.join(''));
// // //    }
// // // });
// // //
// // // setscreen(true);
// // //
// //
function set_footer_context(screenwidth, database, name, line_no) { 
   const colors = ["\x1b[30;47m", "\x1b[0m"];
   const construct = `${colors[0]} ${database}, ${name}, line ${line_no} (press c to run commands or q to quit) ${colors[1]}`;
   return ((construct.length - (colors.join("").length)) < screenwidth) ? construct : null;
}

function paint(window, screensize) {    
   const footer_context = set_footer_context(screensize[0], "Mongo", "Netcat", 0);
   if (footer_context !== null) {
      window.setPrompt(footer_context);	
      process.stdout.write(`\x1b[2J\x1b[3J\x1b[${screensize[1]};0H`);
      window.prompt();
   } else {
      process.stdout.write("\x1b[2J\x1b[3J\x1b[0;0H\nUnsupported screen size.\n");
      process.exit(1);	
   }
}

export default function createWindow() {
   let windowsize = process.stdout.getWindowSize();
   const window = readline.createInterface({
      input: process.stdin,
      output: process.stdout
   });
   process.stdout.on("resize", ()=> {
      windowsize =  process.stdout.getWindowSize();
      paint(window, windowsize);
   });
   paint(window, windowsize);
}
