"use strict";
/* eslint-disable max-len */
exports.__esModule = true;
var path_1 = require("path");
require('dotenv').config({ path: path_1["default"].join(__dirname, '.env') });
var express_1 = require("express");
var yaml_1 = require("yaml");
var fs_1 = require("fs");
var cli_table_1 = require("cli-table");
var child_process_1 = require("child_process");
var http_proxy_middleware_1 = require("http-proxy-middleware");
var chalk_1 = require("chalk");
var yargs_1 = require("yargs/yargs");
var runtimes_1 = require("./runtimes");
var helpers_1 = require("yargs/helpers");
var rootPath = process.env.GILBERT_MODE === 'TEST' ? __dirname : process.cwd();
var app = express_1["default"]();
var argv = yargs_1["default"](helpers_1.hideBin(process.argv)).options({
    configFilePath: { type: 'string', "default": 'config.yaml' },
    port: { type: 'number', "default": 5050 }
}).parseSync();
var gilbertConfig = {};
var table = new cli_table_1["default"]({
    head: ['index', 'service', 'host', 'dispatched routes'].map(function (x) { return chalk_1["default"].green(x); }),
    chars: { 'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
        'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
        'right': '║', 'right-mid': '╢', 'middle': '│' }
});
function parseCli() {
    try {
        gilbertConfig = {
            configFilePath: argv.configFilePath,
            port: argv.port
        };
        var result = {
            success: true,
            msg: 'CLI Parsed'
        };
        return result;
    }
    catch (e) {
        var result = {
            success: false,
            msg: e
        };
        return result;
    }
}
function readConfigFile() {
    var _a, _b;
    try {
        var file = fs_1["default"].readFileSync(path_1["default"].join(rootPath, 'config.yaml'), 'utf8');
        gilbertConfig.configFile = yaml_1["default"].parse(file);
        if (!Array.isArray((_a = gilbertConfig.configFile) === null || _a === void 0 ? void 0 : _a.dispatch)) {
            if (gilbertConfig.configFile) {
                gilbertConfig.configFile.dispatch = yaml_1["default"].parse(fs_1["default"].readFileSync(path_1["default"].join(rootPath, "" + ((_b = gilbertConfig.configFile) === null || _b === void 0 ? void 0 : _b.dispatch)), 'utf8')).dispatch;
            }
        }
        var result = {
            success: true,
            msg: 'Config File Read'
        };
        return result;
    }
    catch (e) {
        var result = {
            success: false,
            msg: e
        };
        return result;
    }
}
function addPortMap(serviceName, index) {
    var newMap = {
        index: index,
        PORT: 4000 + 40 * index
    };
    return newMap;
}
function createApp(serviceConfig, index) {
    try {
        // Get runtime info, path, command etc.
        var currentRuntime = runtimes_1.createRuntime({
            runtime: serviceConfig.runtime,
            context: {
                root: path_1["default"].join(rootPath, serviceConfig.path)
            }
        });
        // Assign port for the current App.
        var currentPortMap = addPortMap(serviceConfig.service, index);
        // Spawn a notainer.js and run the command in that shell.
        var subprocess = child_process_1.spawn('node', [path_1["default"].join(__dirname, 'notainer.js'), currentRuntime.command], {
            cwd: currentRuntime.context.root,
            env: {
                PATH: process.env.PATH,
                PORT: "" + currentPortMap.PORT
            }
        });
        var prefix_1 = serviceConfig.colorStyle(("[" + currentPortMap.index + "] " + serviceConfig.service).padEnd(15) + '|');
        subprocess.stdout.on('data', function (data) {
            var lines = ("" + data).split('\n').filter(function (x) { return x != ''; });
            lines.map(function (x) { return console.log(prefix_1 + ("" + x)); });
        });
        subprocess.on('error', function (err) {
            console.log(prefix_1 + ("" + err));
        });
        // Add proxy for the service.
        app.use(serviceConfig.routes, http_proxy_middleware_1.createProxyMiddleware({
            target: "http://localhost:" + currentPortMap.PORT,
            changeOrigin: true,
            logLevel: 'silent'
        }));
        // Add data to table.
        table.push([
            currentPortMap.index,
            serviceConfig.service,
            "http://localhost:" + currentPortMap.PORT,
            "" + serviceConfig.routes,
        ]);
        var result = {
            success: true,
            msg: "Service Running"
        };
        return result;
    }
    catch (e) {
        console.log(e);
        var result = {
            success: false,
            msg: e
        };
        return result;
    }
    ;
}
function processConfigFile() {
    var _a;
    var colorMaps = [
        chalk_1["default"].magenta,
        chalk_1["default"].red,
        chalk_1["default"].yellow,
        chalk_1["default"].green,
    ];
    try {
        (_a = gilbertConfig.configFile) === null || _a === void 0 ? void 0 : _a.services.map(function (servicePath, index) {
            var _a;
            var serviceConfig = yaml_1["default"].parse(fs_1["default"].readFileSync(path_1["default"].join(rootPath, "/" + servicePath + "/app.yaml"), 'utf8'));
            var dispatchRoutes = (_a = gilbertConfig.configFile) === null || _a === void 0 ? void 0 : _a.dispatch.filter(function (service) { return service.service === serviceConfig.service; }).map(function (routeConfig) { return routeConfig.url.substring(1, routeConfig.url.length - 2); });
            serviceConfig.path = servicePath;
            serviceConfig.routes = dispatchRoutes;
            serviceConfig.colorStyle = colorMaps[index % colorMaps.length];
            createApp(serviceConfig, index);
            return null;
        });
        var result = {
            success: true,
            msg: 'Config Files Processed'
        };
        return result;
    }
    catch (e) {
        var result = {
            success: false,
            msg: e
        };
        return result;
    }
}
function pipeline(functionList) {
    for (var index = 0; index < functionList.length; index++) {
        var currentResult = functionList[index]();
        if (!currentResult.success) {
            console.log("[Error] " + currentResult.msg);
            process.exit(0);
        }
        else {
            console.log(chalk_1["default"].green("[Success]") + ("" + currentResult.msg));
        }
    }
}
pipeline([parseCli, readConfigFile, processConfigFile]);
// function watchTesting() {
//   fs.watch(path.join(__dirname, 'ace'), (eventName, fileName) => {
//     console.log(`Event:${eventName} File:${fileName}`);
//   });
// }
// watchTesting();
app.listen(gilbertConfig.port, function () { return console.log("[" + gilbertConfig.port + "] Running the following services:\n" + table.toString() + "\n"); });
