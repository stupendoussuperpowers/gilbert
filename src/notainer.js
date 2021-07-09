const { spawn, exec } = require("child_process");
const fs = require("fs");
const chalk = require("chalk");

const CLONE_CHILD_CLEARTID = 0x200000;
CLONE_CHILD_SETTID = 0x1000000;
CLONE_DETACHED = 0x400000;
CLONE_FILES = 0x400;
CLONE_FS = 0x200;
CLONE_IO = 0x80000000;
CLONE_NEWIPC = 0x8000000;
CLONE_NEWNET = 0x40000000;
CLONE_NEWNS = 0x20000;
CLONE_NEWPID = 0x20000000;
CLONE_NEWUSER = 0x10000000;
CLONE_NEWUTS = 0x4000000;
CLONE_PARENT = 0x8000;
CLONE_PARENT_SETTID = 0x100000;
CLONE_PTRACE = 0x2000;
CLONE_SETTLS = 0x80000;
CLONE_SIGHAND = 0x800;
CLONE_SYSVSEM = 0x40000;
CLONE_THREAD = 0x10000;
CLONE_UNTRACED = 0x800000;
CLONE_VFORK = 0x4000;
CLONE_VM = 0x100;

function main() {
  commandList = process.argv.splice(2, process.argv.length);

  console.log(process.getgid());

  const prefix = "Notainer.js | ";

  const shellproc = spawn("/bin/sh", [], {
    cwd: process.cwd(),
    env: {
      PATH: process.env.PATH,
      PORT: process.env.PORT,
    },
  });

  shellproc.stdout.on("data", (data) => {
    `${data}`.split("\n").map((x) => console.log(`${prefix}` + x));
  });

  shellproc.on("error", (error) => console.log(`${prefix}` + x));

  process.stdin.on("data", (data) =>
    shellproc.stdin.write(data, (err) => {
      if (err) console.log(err);
    })
  );
}

function execFunction() {
  const comm = exec(
    "/bin/sh",
    (err) => {
      if (err) console.log(err);
    },
    (data) => console.log(process.getuid(), data),
    (err) => console.log(err)
  );

  process.stdin.on("data", (data) =>
    comm.stdin.write(data, (err) => {
      if (err) console.log(err);
    })
  );

  process.config = {
    target_defaults: {
      cflags: [CLONE_NEWUTS, CLONE_NEWPID, CLONE_NEWNS],
    },
  };
}

main();
