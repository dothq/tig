const readline = require("readline");
const chalk = require("chalk");

const rlInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const log = (chan, pl, upPrev, nl, to) => {
    const channels = {
        ERROR: chalk.red.bold,
        WARN: chalk.yellow.bold,
        INFO: chalk.blue.bold,
        SUCCESS: chalk.green.bold,
        PROCESS: chalk.magenta.bold,
        NATIVE: chalk.cyan.bold,
    }
  
    if(upPrev) {
      process.stdout.clearLine();
      process.stdout.cursorTo(to ? to : 0);
      process.stdout.write(`${channels[chan](chan)} ` + pl);
    } else {
      console.log(`${nl ? "\n" : ""}${channels[chan](chan)}`, pl) 
    }
}
  
const ask = (q) => {
    return new Promise((resolve, reject) => {
      rlInterface.question(q, (a) => {
        rlInterface.close();
        resolve(a)
      });
    })
}

module.exports = { log, ask }