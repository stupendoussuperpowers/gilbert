import fs from 'fs';

interface Runtime {
    runtime: string,
    command: string,
    context: string[],
}

interface RuntimeInput {
    runtime: string,
    context: string [],
}

export function createRuntime(input: RuntimeInput) {
  const finalRuntime: Runtime = {
    runtime: input.runtime,
    command: '',
    context: [],
  };

  if (input.runtime == 'nodejs14') {
    // Read script with package.json
    const packagejson = JSON.parse(fs.readFileSync(input.context.join('/'), 'utf8'));

    // dev > start > node index.js

    if (packagejson.scripts?.dev) {
      finalRuntime.command = packagejson.scripts.dev;
    } else if (packagejson.scripts?.start) {
      finalRuntime.command =packagejson.scripts.start;
    } else {
      // In case no start / dev script
      finalRuntime.command = 'node index.js';
    }
  }

  return finalRuntime;
}
