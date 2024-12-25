// 
// "use strict";
// 
// import * as readline from "node:readline";
// 
// let windowsize = process.stdout.getWindowSize();
// let screen_section = 0; /* 0 means default, 1 means command input */
// const colors = ["\x1b[30;47m", "\x1b[0m"];
// let line_no = 0; /* akin to page tracker id */
// const outputbuff = [];
// 
// // let inputbuffer = [];
// // let page = 0;
// // let outcursor = 0;
// //
// // function paint() {
// //    let page_w;
// //    page_w  = outputbuffer > (page_w === windowsize[1] - 2) ? page_w : outputbuffer.length ;
// //
// //    if (outcursor !== page_w)
// //       for (let i = 0; i < page_w; ++i) {
// //          process.stdout.write(outputbuffer[i] + "\n");
// //          ++outcursor;
// //       }
// // }
// //
// //
// // process.stdin.on("keypress", (char, meta)=> {
// //    if (meta.sequence === '\r') {
// //      // if (inputbuffer.length === 0) {
// //          // render screen
// //          //process.stdout.write(`\x1b[2;${inputbuffer.length + 1}H`);
// //       //} else {
// //          paint();
// //          // process command,
// //          // clear query,
// //          // render screen
// //       //}
// //    } else {
// //       process.stdout.clearLine(0);
// //       process.stdout.write("\x1b[2;0H");
// //       if (meta.sequence === '\x7F')
// //          inputbuffer.pop();
// //       else
// //          inputbuffer.push(meta.sequence);
// //       process.stdout.write(inputbuffer.join(''));
// //    }
// // });
// 
// function draw_welcome_screen(screensize) {
   // const welcometxt = "Welcome to dscat, please input a query";
   // console.log(`\x1b[${screensize[1] / 2};${Math.floor(screensize[0] / 2) - (Math.round(welcometxt.length / 2))}H\x1b[1m${welcometxt}\x1b[0m`);
// }
// 
// function set_footer_context(screenwidth, database, name) {
   // const construct = `${colors[0]} ${database}, ${name}, line ${line_no} (start typing to run a query, or press q to quit) ${colors[1]}`;
   // return ((construct.length - (colors.join("").length)) < screenwidth) ? construct : null;
// }
// 
// /* mode, 0 = "repaint", 1 = "refresh", 2 = "switch to input" */
// function paint(mode, window, screensize, database, name) {
   // const footer_context = (mode === 0) && set_footer_context(screensize[0], database, name);
   // if (footer_context !== null) {
      // if (mode === 2) {
         // window.setPrompt("\x1b[2m-- INSERT --\x1b[0m ");
      // } else {
         // if (mode === 0) window.setPrompt(footer_context);
         // process.stdout.write(`\x1b[0;0H\x1b[2J\x1b[3J`);
         // draw_welcome_screen(screensize);
      // }
      // process.stdout.write(`\x1b[${screensize[1]};0H`);
      // window.prompt();
   // } else {
      // process.stdout.write("\x1b[2J\x1b[3J\x1b[0;0H\nUnsupported screen size.\n");
      // process.exit(1);
   // }
// }
// 
// export default function createWindow({ database, name }) {
   // const window = readline.createInterface({
      // input: process.stdin,
      // output: process.stdout
   // });
 // 
   // process.stdout.on("resize", ()=> {
      // windowsize =  process.stdout.getWindowSize();
      // paint(screen_section === 0 ? 0 : 2, window, database, name);
   // });
   // 
   // process.stdin.on("keypress", (char, meta)=> {
      // if (screen_section === 0) {
         // if (/^(?! )[A-Za-z0-9]+(?:[]+A-Za-z0-9)*$/.test(meta.sequence)) {
            // screen_section = 1;
            // paint(2, window);
         // } else paint(1, window, windowsize);
      // } else {}
   // });
   // 
   // paint(0, window, windowsize, database, name);
// }
