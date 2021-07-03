const { spawn } = require("child_process");
const fs = require("fs");

function main() {
  commandList = process.argv.splice(2, process.argv.length);

  console.log(commandList);

  console.log("Hello from the container.js file");
  const shellproc = spawn("/bin/sh", [], {
    cwd: process.cwd(),
    env: {
      PATH: process.env.PATH,
      PORT: `${7000}`,
    },
  });

  shellproc.stdout.on("data", (data) => {
    `${data}`.split("\n").map((x) => console.log(x));
  });

  shellproc.on("error", (error) => console.log(error));

  // process.stdin.on("data", (data) => {
  //   shellproc.stdin.write(data, (err) => {
  //     if (err) console.log(err);
  //   });
  // });

  commandList[0].split("&&").map((x, i) => {
    console.log(`${i} -> ${x.trim(" ")}\n`);
    shellproc.stdin.write(`${x.trim(" ")}\n`, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log("Ended", i);
  });
}

main();
