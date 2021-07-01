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

interface ServiceConfiguration {
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

let gilbertConfig: GilbertConfiguartion = {};

const table = new Table({
  head: ['service', 'host', 'dispatched routes'],
});


function parseCli() {
  gilbertConfig = {
    configFilePath: argv.configFilePath,
    port: argv.port,
  };
}

function readConfigFile() {
  const file :string = fs.readFileSync(path.join(__dirname, `./${gilbertConfig.configFilePath}`), 'utf8');
  gilbertConfig.configFile = yaml.parse(file);
  // If path provided
  if (!Array.isArray(gilbertConfig.configFile?.dispatch)) {
    if (gilbertConfig.configFile) {
      gilbertConfig.configFile.dispatch = yaml.parse(
          fs.readFileSync(`${gilbertConfig.configFile?.dispatch}`, 'utf8'),
      ).dispatch;
    }
  }
  console.log('✓ Read config file');
}

const portMapping: LooseObject = {};

function addPortMap(serviceName: string, index: number) {
  const newMap: PortMap = {
    index: index,
    PORT: 4000 + 40*index,
  };

  // portMapping?[serviceName] = newMap: Object;

  return newMap;
}

function createApp(serviceConfig: ServiceConfiguration, index: number) {
  let command = '';
  if (serviceConfig.runtime === 'nodejs14') {
    command = 'node';
  } else {
    throw Error(`Invalid runtime for ${serviceConfig.service}`);
  }

  const currentPortMap = addPortMap(serviceConfig.service, index);
  console.log('Here:', currentPortMap);

  const subprocess = spawn(command, [path.join(__dirname, `${serviceConfig.path}/index.js`)], {
    cwd: `${process.cwd()}`,
    env: {
      PATH: process.env.path,
      PORT: String(currentPortMap.PORT),
    },
  });

  const prefix = serviceConfig.colorStyle(`[${currentPortMap.index}] ${serviceConfig.service}`.padEnd(15) + '|');

  subprocess.stdout.on('data', (data) => {
    const lines = `${data}`.split('\n');
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
      }),
  );

  table.push([
    serviceConfig.service,
    `http://localhost:${currentPortMap.PORT}`,
    `${serviceConfig.routes}`,
  ]);
}

function processConfigFile() {
  const colorMaps = [
    chalk.magenta,
    chalk.red,
    chalk.yellow,
    chalk.green,
  ];

  gilbertConfig.configFile?.services.map((servicePath, index) => {
    const serviceConfig: ServiceConfiguration = yaml.parse(
        fs.readFileSync(path.join(__dirname, `${servicePath}/app.yaml`), 'utf8'),
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
}


parseCli();
readConfigFile();
processConfigFile();

app.listen(gilbertConfig.port, () => console.log(`Running the following services:\n${table.toString()}\n`));
