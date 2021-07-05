"use strict";
exports.__esModule = true;
exports.createRuntime = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
function createRuntime(input) {
    var _a, _b;
    var finalRuntime = {
        runtime: input.runtime,
        command: '',
        context: input.context
    };
    if (input.runtime == 'nodejs14') {
        // Read script with package.json
        var packagejson = JSON.parse(fs_1["default"].readFileSync(path_1["default"].join(input.context.root, 'package.json'), 'utf8'));
        // Command priority: dev > start > node index.js
        if ((_a = packagejson.scripts) === null || _a === void 0 ? void 0 : _a.dev) {
            finalRuntime.command = packagejson.scripts.dev;
        }
        else if ((_b = packagejson.scripts) === null || _b === void 0 ? void 0 : _b.start) {
            finalRuntime.command = packagejson.scripts.start;
        }
        else {
            // In case no start / dev script
            finalRuntime.command = 'node index.js';
        }
    }
    return finalRuntime;
}
exports.createRuntime = createRuntime;
