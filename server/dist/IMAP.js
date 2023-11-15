"use strict";
// talks to an IMAP server to list mailboxes and messages and to retrieve messages
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const ImapClient = require("emailjs-imap-client");
const mailparser_1 = require("mailparser");
// disable certificate validation for bypassing SSL certificate validation and proceed with the connection
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
class Worker {
    // the server information is passed in to the constructor and stored.
    constructor(inServerInfo) {
        Worker.serverInfo = inServerInfo;
    }
    /**
     * Connect to the SMTP server and return a emailjs-imap-client object for operations to use
     *
     * @return An ImapClient instance.
     */
    // The await keyword is used to wait for a promise to resolve or reject before continuing with the execution of the function
    // and will return a promise implicitly
    connectToServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new ImapClient.default(Worker.serverInfo.imap.host, Worker.serverInfo.imap.port, { auth: Worker.serverInfo.imap.auth });
            client.logLevel = client.LOG_LEVEL_NONE;
            // error handler without re-trying
            client.onerror = (inError) => {
                console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
            };
            yield client.connect();
            return client;
        });
    }
    /**
     * Returns a list of all (top-level) mailboxes
     *
     * @return An array of mailboxs
     */
    listMailboxes() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            const mailboxes = yield client.listMailboxes();
            yield client.close();
            // Translate from emailjs-imap-client mailbox objects to app-specific objects
            // At the same time, flatten the list of mailboxes to a one-dimensional array of objects via iterateChildren function recursion
            const finalMailboxes = [];
            const iterateChildren = (inArray) => {
                // For each mailbox encountered, added new object that contains name and path to finalMailboxes
                inArray.forEach((inValue) => {
                    finalMailboxes.push({
                        name: inValue.name,
                        path: inValue.path
                    });
                    // handle with children property
                    iterateChildren(inValue.children);
                });
            };
            iterateChildren(mailboxes.children);
            return finalMailboxes;
        });
    }
    /**
     * Lists basic information about messages in a named mailbox
     *
     * @param inCallOptions An object implementing the ICallOptions interface
     * @return              An array of messages
     */
    listMessages(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            // We have to select the mailbox first. This gives us the message count.
            // The inCallOptions object contain the name of the mailbox in mailbox field
            const mailbox = yield client.selectMailbox(inCallOptions.mailbox);
            if (mailbox.exists === 0) {
                yield client.close();
                return [];
            }
            const messages = yield client.listMessages(inCallOptions.mailbox, 
            // messages type: messages beginning with the first one and all messages after it. *: any value
            "1:*", ["uid", "envelope"]);
            yield client.close();
            // Translate from emailjs-imap-client message objects to app-specific objects.
            const finalMessages = [];
            messages.forEach((inValue) => {
                const fromAddress = inValue.envelope.from && inValue.envelope.from[0] && inValue.envelope.from[0].address;
                finalMessages.push({
                    id: inValue.uid,
                    date: inValue.envelope.date,
                    // provide a default value because outlook doesn't provide from data in envelope when taking Drafts
                    from: fromAddress || 'pohsuanh@outlook.com',
                    subject: inValue.envelope.subject
                });
            });
            return finalMessages;
        });
    }
    /**
     * Gets the plain text body of a single message.
     *
     * @param  inCallOptions An object implementing the ICallOptions interface
     * @return               The plain text body of the message
     */
    getMessageBody(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            const messages = yield client.listMessages(inCallOptions.mailbox, inCallOptions.id, ["body[]"], { byUid: true });
            // parses the message into a ParsedMail object
            const parsed = yield (0, mailparser_1.simpleParser)(messages[0]["body[]"]);
            yield client.close();
            return parsed.text;
        });
    }
    /**
     * Deletes message
     *
     * @param inCallOptions An object implementing the ICallOptions interface
     */
    deleteMessage(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectToServer();
            const messages = yield client.listMessages(inCallOptions.mailbox, inCallOptions.id, ["uid"], { byUid: true });
            if (inCallOptions.mailbox !== 'Deleted') {
                yield client.copyMessages(inCallOptions.mailbox, messages[0]['uid'], 'Deleted', { byUid: true });
            }
            yield client.deleteMessages(inCallOptions.mailbox, messages[0]['uid'], { byUid: true });
            yield client.close();
        });
    }
}
exports.Worker = Worker;
//# sourceMappingURL=IMAP.js.map