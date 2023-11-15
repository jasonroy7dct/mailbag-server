"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverInfo = void 0;
// The configuration file that provides the IMAP and SMTP servers, the server will connect to and where that information will be stored.
const path = require("path");
const fs = require("fs");
// read the serverInfo.json file and create an object
const rawInfo = fs.readFileSync(path.join(__dirname, "../serverInfo.json"));
// this object contains the information needed to connect to the server
exports.serverInfo = JSON.parse(rawInfo);
//# sourceMappingURL=ServerInfo.js.map