"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// the main entry point of the server APIs
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const ServerInfo_1 = require("./ServerInfo");
const IMAP = __importStar(require("./IMAP"));
const SMTP = __importStar(require("./SMTP"));
const Contacts = __importStar(require("./Contacts"));
// creates our Express app.
const app = (0, express_1.default)();
// add middleware to Express with JSON in request body
app.use(express_1.default.json());
// Serve the client to a requested browser
// The static middleware is a built-in middleware for serving static resources
// __dirname is the directory the current script is in
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
// Use CORS so that we can call the API
// CORS is a mechanism that allows or restricts the resources on a web page to be requested from another domain outside the domain from which the first resource was served
app.use(function (inRequest, inResponse, inNext) {
    // asterisk means browser will allow the call regardless of where it’s launched from.
    inResponse.header("Access-Control-Allow-Origin", "*");
    // Typical http methods we will accept from clients
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    // accept additional header
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    // continue the middleware chain, so the request can continue to be processed as required
    inNext();
});
// REST API Endpoint: List Mailboxes
// Express app is acting as a proxy to the IMAP (and also SMTP and Contacts) object
app.get("/mailboxes", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const mailboxes = yield imapWorker.listMailboxes();
        inResponse.status(200);
        inResponse.json(mailboxes);
    }
    catch (inError) {
        console.error("Error in /mailboxes endpoint:", inError);
        inResponse.status(500); // Internal Server Error
        inResponse.send("error");
    }
}));
// REST API Endpoint: List Mailboxes' messages
app.get("/mailboxes/:mailbox", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const messages = yield imapWorker.listMessages({
            mailbox: inRequest.params.mailbox
        });
        inResponse.status(200);
        inResponse.json(messages);
    }
    catch (inError) {
        console.error("Error in getting mailbox:", inError);
        inResponse.status(400).send("Error in getting mailbox");
    }
}));
// REST API Endpoint: Get Message
app.get("/messages/:mailbox/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const messageBody = yield imapWorker.getMessageBody({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        inResponse.status(200);
        inResponse.send(messageBody);
    }
    catch (inError) {
        inResponse.status(400);
        inResponse.send("error");
    }
}));
// REST API Endpoint: Delete Message
app.delete("/messages/:mailbox/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        yield imapWorker.deleteMessage({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        inResponse.status(200);
        inResponse.send("ok");
    }
    catch (inError) {
        inResponse.status(400);
        inResponse.send("error");
    }
}));
// REST API Endpoint: Send Message
app.post("/messages", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const smtpWorker = new SMTP.Worker(ServerInfo_1.serverInfo);
        // pre-condition check
        const { to, from, subject, text } = inRequest.body;
        if (!to || !from || !subject || !text) {
            inResponse.status(400).send("Missing required fields");
            return;
        }
        const result = yield smtpWorker.sendMessage({ to, from, subject, text });
        inResponse.status(201).send(result);
    }
    catch (inError) {
        console.error("Error in sending mail:", inError);
        inResponse.status(400).send("Error in sending mail");
    }
}));
// REST API Endpoint: List Contacts
app.get("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        const contacts = yield contactsWorker.listContacts();
        inResponse.status(200);
        inResponse.json(contacts);
    }
    catch (inError) {
        inResponse.status(400);
        inResponse.send("error");
    }
}));
// REST API Endpoint: Add Contact
app.post("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        const contact = yield contactsWorker.addContact(inRequest.body);
        inResponse.status(201);
        inResponse.json(contact);
    }
    catch (inError) {
        inResponse.status(400);
        inResponse.send("error");
    }
}));
// REST API Endpoint: Update Contact
app.put("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        const contact = yield contactsWorker.updateContact(inRequest.body);
        inResponse.status(202);
        inResponse.json(contact);
    }
    catch (inError) {
        inResponse.status(400);
        inResponse.send("error");
    }
}));
// REST API Endpoint: Delete Contact
app.delete("/contacts/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        yield contactsWorker.deleteContact(inRequest.params.id);
        inResponse.status(200);
        inResponse.send("ok");
    }
    catch (inError) {
        inResponse.status(400);
        inResponse.send("error");
    }
}));
// app listening on port 80
app.listen(80, () => {
    console.log("MailBag server open for requests");
});
//# sourceMappingURL=main.js.map