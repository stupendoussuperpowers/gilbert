/* eslint-disable max-len */
import express from 'express';
import yaml from 'yaml';
import fs from 'fs';
import Table from 'cli-table';
import {spawn} from 'child_process';
import {createProxyMiddleware} from 'http-proxy-middleware';
import chalk, {Chalk} from 'chalk';
import path from 'path';
import yargs from 'yargs/yargs';
import {createRuntime, RuntimeContext, RuntimeInput, Runtime} from './runtimes';
import {hideBin} from 'yargs/helpers';

const app: express.Application = express();

const argv = yargs(hideBin(process.argv)).options({
  configFilePath: {type: 'string', default: 'config.yaml'},
  port: {type: 'number', default: 5050},
}).parseSync();

interface Configuration {
    dispatch: any,
    services: [],
}

export interface ServiceConfiguration {
    service: string,
    path: string,
    routes: [],
    runtime: string,
    colorStyle: any,
}

type LooseObject = {
  [key: string] : any
}

type PortMap = {
  index: number,
  PORT: number,
}

interface GilbertConfiguartion {
  configFilePath?: string,
  configFile?:Configuration,
  port?: number,
  portMapping?: {[key:string] : PortMap},
  serviceMap?: LooseObject,
}

interface ExecutionResult {
  success: boolean,
  msg?: string,
}

let gilbertConfig: GilbertConfiguartion = {};

const table = new Table({
  head: ['index', 'service', 'host', 'dispatched routes'].map((x) => chalk.green(x)),
  chars: {'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
    'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
    'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
    'right': '║', 'right-mid': '╢', 'middle': '│'},
});


function parseCli() {
  try {
    gilbertConfig = {
      configFilePath: argv.configFilePath,
      port: argv.port,
    };
    const result: ExecutionResult = {
      success: true,
      msg: 'CLI Parsed',
    };
    return result;
  } catch (e: any) {
    const result: ExecutionResult = {
      success: false,
      msg: e,
    };
    return result;
  }
}

function readConfigFile() {
  try {
    // console.log(gilbertConfig.configFilePath);

    const file :string = fs.readFileSync(path.join(/* process.cwd()*/ __dirname, 'config.yaml'), 'utf8');
    gilbertConfig.configFile = yaml.parse(file);

    if (!Array.isArray(gilbertConfig.configFile?.dispatch)) {
      if (gilbertConfig.configFile) {
        gilbertConfig.configFile.dispatch = yaml.parse(
            fs.readFileSync(`${gilbertConfig.configFile?.dispatch}`, 'utf8'),
        ).dispatch;
      }
    }
    const result: ExecutionResult = {
      success: true,
      msg: 'Config File Read',
    };
    return result;
  } catch (e) {
    const result: ExecutionResult = {
      success: false,
      msg: e,
    };
    return result;
  }
}

function addPortMap(serviceName: string, index: number) {
  const newMap: PortMap = {
    index: index,
    PORT: 4000 + 40*index,
  };

  return newMap;
}

function createApp(serviceConfig: ServiceConfiguration, index: number) {
  try {
    const currentRuntime = createRuntime({
      runtime: serviceConfig.runtime,
      context: {
        root: path.join(__dirname, serviceConfig.path),
      },
    });

    const currentPortMap = addPortMap(serviceConfig.service, index);

    const subprocess = spawn('node',
        [path.join(__dirname, 'notainer.js'), currentRuntime.command], {
          cwd: currentRuntime.context.root,
          env: {
            PATH: process.env.PATH,
            PORT: `${currentPortMap.PORT}`,
          },
        },
    );

    const prefix = serviceConfig.colorStyle(`[${currentPortMap.index}] ${serviceConfig.service}`.padEnd(15) + '|');

    subprocess.stdout.on('data', (data) => {
      const lines = `${data}`.split('\n').filter((x) => x!='');

      lines.map((x: string) => console.log(prefix + `${x}`));
    });

    subprocess.on('error', (err) => {
      console.log(prefix + `${err}`);
    });

    app.use(
        serviceConfig.routes,
        createProxyMiddleware({
          target: `http://localhost:${currentPortMap.PORT}`,
          changeOrigin: true,
          logLevel: 'silent',
        }),
    );

    table.push([
      currentPortMap.index,
      serviceConfig.service,
      `http://localhost:${currentPortMap.PORT}`,
      `${serviceConfig.routes}`,
    ]);

    const result: ExecutionResult = {
      success: true,
      msg: `Service Running`,
    };
    return result;
  } catch (e:any) {
    console.log(e);
    const result: ExecutionResult = {
      success: false,
      msg: e,
    };
    return result;
  };
}

function processConfigFile() {
  const colorMaps = [
    chalk.magenta,
    chalk.red,
    chalk.yellow,
    chalk.green,
  ];

  try {
    gilbertConfig.configFile?.services.map((servicePath, index) => {
      const serviceConfig: ServiceConfiguration = yaml.parse(
          fs.readFileSync(path.join(process.cwd(), `/src/${servicePath}/app.yaml`), 'utf8'),
      );

      const dispatchRoutes: [] = gilbertConfig.configFile?.dispatch.
          filter((service: any) => service.service === serviceConfig.service)
          .map((routeConfig: any) => routeConfig.url.substring(1, routeConfig.url.length - 2));

      serviceConfig.path = servicePath;
      serviceConfig.routes = dispatchRoutes;
      serviceConfig.colorStyle = colorMaps[index%colorMaps.length];
      createApp(serviceConfig, index);
      return null;
    });

    const result: ExecutionResult = {
      success: true,
      msg: 'Config Files Processed',
    };

    return result;
  } catch (e:any) {
    const result: ExecutionResult = {
      success: false,
      msg: e,
    };
    return result;
  }
}

function pipeline(functionList: Function[]) {
  for (let index=0; index<functionList.length; index++) {
    const currentResult = functionList[index]();
    if (!currentResult.success) {
      console.log(`[Error] ${currentResult.msg}`);
      process.exit(0);
    } else {
      console.log(chalk.green(`[Success]`) + `${currentResult.msg}`);
    }
  }
}

pipeline([parseCli, readConfigFile, processConfigFile]);

// parseCli();
// readConfigFile();

// function watchTesting() {
//   fs.watch(path.join(__dirname, 'ace'), (eventName, fileName) => {
//     console.log(`Event:${eventName} File:${fileName}`);
//   });
// }

// watchTesting();

app.listen(
    gilbertConfig.port,
    () => console.log(
        `[${gilbertConfig.port}] Running the following services:\n${table.toString()}\n`,
    ),
);
