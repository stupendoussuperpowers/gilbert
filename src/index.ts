
// const express = require("express");
// const app = express();

import express from 'express';

const app: express.Application = express();


// const yaml = require("yaml");
// const fs = require("fs");

// const Table = require("cli-table");
// const colors = require("colors");

// var configuration = {
//   configFilePath: "config.yaml",
//   port: 5050,
//   file: null,
//   configFile: null,
//   serviceMap: null,
// };

// var configFilePath = "config.yaml";
// var port = 5050;

// var file;
// var configFile;

// var serviceMap;

// var table = new Table({
//   head: ["service".green, "host".green, "dispatched routes".green],
// });

// // Read CLI arguments
// function readCli() {
//   if (process.argv.length >= 3) {
//     configFilePath = process.argv[2];
//   }
// }

// // Reading config file

// function readConfigFile() {
//   file = fs.readFileSync(`./${configFilePath}`, "utf8");
//   configFile = yaml.parse(file);
//   //If path provided
//   if (!Array.isArray(configFile.dispatch)) {
//     configFile.dispatch = yaml.parse(
//       fs.readFileSync(`${configFile.dispatch}`, "utf8")
//     ).dispatch;
//   }
//   console.log("✓ Read config file");
// }

// // Processing config files for services

// // function processConfig() {
// //   serviceMap = configFile.services.map((servicePath, index) => {
// //     var serviceConfig = yaml.parse(
// //       fs.readFileSync(`${servicePath}/app.yaml`, "utf8")
// //     );

// //     var curApp = require(servicePath);

// //     // If explicit
// //     var dispatchRoutes = configFile.dispatch
// //       .filter((x) => x.service === serviceConfig.service)
// //       .map((routeConfig) =>
// //         routeConfig.url.substring(1, routeConfig.url.length - 2)
// //       );

// //     return [curApp, dispatchRoutes, serviceConfig.service];
// //   });
// //   console.log("✓ YAMLs processed for services");
// // }

// // function mountRoutes() {
// //   serviceMap.map((service, index) => {
// //     app.use(service[1], service[0]);
// //     table.push([
// //       service[2],
// //       `http://localhost:` + `${port}`.bold + `${service[1]}`.yellow,
// //     ]);
// //   });
// //   console.log("✓ Routes Mounted");
// // }

// // Mapping services to dispatch

// // Listening

// // readCli();
// // readConfigFile();
// // processConfig();
// // mountRoutes();

// const { spawn } = require("child_process");
// const { createProxyMiddleware } = require("http-proxy-middleware");
// const chalk = require("chalk");

// const portMapping = {};
// const colorList = [chalk.blue, chalk.green, chalk.magenta, chalk.cyan];

// function addPortMap(serviceName) {
//   portMapping[serviceName] = {
//     index: Object.keys(portMapping).length,
//     PORT: 4000 + 40 * Object.keys(portMapping).length,
//   };
//   // console.log(portMapping);
//   return portMapping[serviceName];
// }

// function createApp(serviceConfig) {
//   //console.log(serviceConfig);
//   var command = "";
//   if (serviceConfig.runtime === "nodejs14") {
//     command = "node";
//   } else {
//     throw Error(
//       `Invalid runtime ${serviceConfig.runtime} for service:${serviceConfig.service}`
//     );
//   }

//   const currentPortMap = addPortMap(serviceConfig.service);

//   const subprocess = spawn(command, [`${serviceConfig.path}/index.js`], {
//     cwd: `${process.cwd()}`,
//     env: {
//       PATH: process.env.PATH,
//       PORT: currentPortMap.PORT,
//     },
//   });

//   const prefix = colorList[currentPortMap.index % colorList.length](
//     `[${currentPortMap.index}] ${serviceConfig.service}`.padEnd(15) + "|"
//   );

//   subprocess.stdout.on("data", (data) => {
//     const lines = `${data}`.split("\n");
//     lines.map((x) => console.log(prefix + `${x}`));
//   });

//   subprocess.on("error", (err) => {
//     console.log(prefix + `${err}`);
//   });

//   app.use(
//     serviceConfig.routes,
//     createProxyMiddleware({
//       target: `http://localhost:${currentPortMap.PORT}`,
//       changeOrigin: true,
//     })
//   );

//   table.push([
//     serviceConfig.service,
//     `http://localhost:${currentPortMap.PORT}`,
//     `${serviceConfig.routes}`,
//   ]);
// }

// function processConfig() {
//   serviceMap = configFile.services.map((servicePath, index) => {
//     var serviceConfig = yaml.parse(
//       fs.readFileSync(`${servicePath}/app.yaml`, "utf8")
//     );

//     var dispatchRoutes = configFile.dispatch
//       .filter((x) => x.service === serviceConfig.service)
//       .map((routeConfig) =>
//         routeConfig.url.substring(1, routeConfig.url.length - 2)
//       );

//     serviceConfig.path = servicePath;
//     serviceConfig.routes = dispatchRoutes;
//     createApp(serviceConfig);
//   });
// }

// readConfigFile();
// processConfig();

// app.listen(3030, () => console.log(`\n${table.toString()}\n`));
