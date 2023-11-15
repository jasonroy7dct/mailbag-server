// The configuration file that provides the IMAP and SMTP servers, the server will connect to and where that information will be stored.
const path = require("path");
const fs = require("fs");

// define the information of the server
export interface IServerInfo {
    smtp: {
        host: string,
        port: number,
        auth: {
            user: string,
            pass: string
        }
    },
    imap: {
        host: string,
        port: number,
        auth: {
            user: string,
            pass: string
        }
    }
}

export let serverInfo: IServerInfo

// read the serverInfo.json file and create an object
const rawInfo: string = fs.readFileSync(path.join(__dirname, "../serverInfo.json"));
// this object contains the information needed to connect to the server
serverInfo = JSON.parse(rawInfo);
