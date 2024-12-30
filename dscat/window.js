
"use strict";

let database;
let name;
let windowsize;
let mode;
const INPUT = {
   cursor: 1,
   buffer: ""
}
const OUTPUT = {
   cursor: 0,
   buffer: []
}

INPUT.write = (char, ghostwrite) => {
   if (!ghostwrite) {
      INPUT.buffer = INPUT.buffer.length + 1 === INPUT.cursor ?
         INPUT.buffer += char : 
         INPUT.buffer.slice(0, INPUT.cursor - 1) + char + INPUT.buffer.slice(INPUT.cursor - 1);
      INPUT.cursor++;	
   }
   process.stdout.write(`\x1b[${windowsize[1]};0H\x1b[0J${INPUT.buffer}\x1b[${windowsize[1]};${INPUT.cursor}H`);	
   
}
INPUT.leftmv = () => {
   if (INPUT.cursor > 1)	{
      INPUT.cursor--;
      INPUT.write(null, true);
   }
}
INPUT.rightmv = () => {
   if (INPUT.cursor <= INPUT.buffer.length)	{
      INPUT.cursor++;
      INPUT.write(null, true);
   }
}
INPUT.remove = () => {
   if (INPUT.cursor > 1) {
      INPUT.buffer = INPUT.buffer.length + 1 === INPUT.cursor ?
         INPUT.buffer.slice(0, INPUT.buffer.length - 1) :
         INPUT.buffer.slice(0, INPUT.cursor - 2) + INPUT.buffer.slice(INPUT.cursor - 1);
      INPUT.leftmv();
      INPUT.write(null, true);
   }   
}
INPUT.exec = () => {
   if (INPUT.buffer.length > 0 && !/^\s+$/.test(INPUT.buffer)) {
      /* parse and execute query */ 
      process.stdout.write("\x1b[2J\x1b[3J\x1b[1;1H");	
   } else INPUT.write(null, true);	
}

function draw_welcome_screen() {
   const welcometxt = "Welcome to dscat. Press ctrl + i to write a query, and enter to run";
   process.stdout.write(`\x1b[${windowsize[1] / 2};${Math.floor(windowsize[0] / 2) - (Math.round(welcometxt.length / 2))}H\x1b[1m${welcometxt}\x1b[0m`);
}

function get_status_line(screenwidth) {
   const colors = ["\x1b[30;47m", "\x1b[0m"];
   const cursorpos = `\x1b[${windowsize[1]};0H\x1b[0J`;
   const construct = `${cursorpos}${colors[0]} ${database}, ${name}, line ${OUTPUT.cursor} (press ctrl + i to write a query, or ctrl + q to quit) ${colors[1]}`;
   return (((construct.length - colors.join("").length) - cursorpos.length) < screenwidth) ? construct : null;
}

function paint() {
   process.stdout.write("\x1b[0;0H\x1b[2J\x1b[3J");
   if (OUTPUT.buffer.length === 0) draw_welcome_screen();
   
   const statusline = mode === 0 && get_status_line(windowsize[0]);
   if (mode === 1) INPUT.write(null, true);
   else if (mode === 0 && statusline)
      process.stdout.write(statusline);
   else {
      process.stdout.write("\x1b[2J\x1b[3J\x1b[0;0H\nUnsupported screen size.\n");
      process.exit(1);
   }
}

export default function createWindow(params) {
   database = params.database;
   name = params.name;
   windowsize = process.stdout.getWindowSize();
   mode = 0; /* 0 means read, 1 write */
   params = null;
   
   process.stdin.setRawMode(true);
 
   process.stdout.on("resize", ()=> {
      windowsize = process.stdout.getWindowSize();
      paint();
   });
   
   process.stdin.on("data", (char)=> {
      char = char.toString("utf-8");

      if (char=== "\x11") {
         process.stdout.write("\x1b[2J\x1b[3J\x1b[0;0H");
         process.exit(0);
      }
      if (char === "\x09") {
         mode = mode === 1 ? 0 : 1;
         paint();
      } else if (mode === 1) {
         switch (char) {
            case "\x1B[C": INPUT.rightmv(); break;
            case "\x1B[D": INPUT.leftmv(); break;
            case "\x7F": INPUT.remove(); break;
            case "\r": INPUT.exec(); break;
            default: INPUT.write(char);
         }
      }
   });
   
   paint();

   process.stdin.resume();
}
