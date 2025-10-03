const readline = require("readline");

function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${question} (y/n): `, (ans) => {
      rl.close();
      resolve(String(ans).trim().toLowerCase().startsWith("y"));
    });
  });
}

module.exports = { askYesNo };
