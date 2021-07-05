import fs from 'fs';
import path from 'path';

export interface RuntimeContext {
  root: string,
}

export interface Runtime {
    runtime: string,
    command: string,
    context: RuntimeContext,
}

export interface RuntimeInput {
    runtime: string,
    context: RuntimeContext,
}

export function createRuntime(input: RuntimeInput) {
  const finalRuntime: Runtime = {
    runtime: input.runtime,
    command: '',
    context: input.context,
  };

  if (input.runtime == 'nodejs14') {
    // Read script with package.json
    const packagejson = JSON.parse(
        fs.readFileSync(
            path.join(input.context.root, 'package.json'), 'utf8',
        ),
    );

    // Command priority: dev > start > node index.js

    if (packagejson.scripts?.dev) {
      finalRuntime.command = packagejson.scripts.dev;
    } else if (packagejson.scripts?.start) {
      finalRuntime.command = packagejson.scripts.start;
    } else {
      // In case no start / dev script
      finalRuntime.command = 'node index.js';
    }
  }

  return finalRuntime;
}
