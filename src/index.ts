/* eslint-disable max-len */
import express from 'express';
import yaml from 'yaml';
import fs from 'fs';
import Table from 'cli-table';
import {spawn} from 'child_process';
import {createProxyMiddleware} from 'http-proxy-middleware';
import chalk from 'chalk';

const app: express.Application = express();

interface configuration {
    dispatch: any,
    service: [],
}

interface serviceConfiguration {
    service: string,
    path: string,
    routes: [],
    runtime: string,
}

interface LooseObject {
  [key: string] : any
}

const configFilePath = 'config.yaml';
const port = 5050;

let file :string;
let configFile:configuration;

let serviceMap: Object;

const table = new Table({
  head: ['service', 'host', 'dispatched routes'],
});

table.push(['service1', 'host1', 'dispatch1']);

function readConfigFile() {
  file = fs.readFileSync(`./${configFilePath}`, 'utf8');
  configFile = yaml.parse(file);
  // If path provided
  if (!Array.isArray(configFile.dispatch)) {
    configFile.dispatch = yaml.parse(
        fs.readFileSync(`${configFile.dispatch}`, 'utf8'),
    ).dispatch;
  }
  console.log('✓ Read config file');
}

const portMapping: LooseObject = {};

function addPortMap(serviceName: string) {
  portMapping[serviceName] = {
    index: Object.keys(portMapping).length,
    PORT: 4000 + 40* Object.keys(portMapping).length,
  };
  return portMapping[serviceName];
}

function createApp(serviceConfig: serviceConfiguration) {
  let command = '';
  if (serviceConfig.runtime === 'nodejs14') {
    command = 'node';
  } else {
    throw Error(`Invalid runtime for ${serviceConfig.service}`);
  }

  const currentPortMap = addPortMap(serviceConfig.service);

  const subprocess = spawn(command, [`${serviceConfig.path}/index.js`], {
    cwd: `${process.cwd()}`,
    env: {
      PATH: process.env.path,
      PORT: currentPortMap.PORT,
    },
  });

  const prefix = chalk.magenta(`[${currentPortMap.index}] ${serviceConfig.service}`.padEnd(15) + '|');

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
  serviceMap = configFile.service.map((servicePath, index) => {
    const serviceConfig: serviceConfiguration = yaml.parse(
        fs.readFileSync(`${servicePath}/app.yaml`, 'utf8'),
    );

    const dispatchRoutes: [] = configFile.dispatch.
        filter((service: any) => service.service === serviceConfig.service)
        .map((routeConfig: any) => routeConfig.url.substring(1, routeConfig.url.length - 2));

    serviceConfig.path = servicePath;
    serviceConfig.routes = dispatchRoutes;
    createApp(serviceConfig);
    return null;
  });
}


app.listen(port, () => console.log(`Running the following services:\n${table.toString()}\n`));
