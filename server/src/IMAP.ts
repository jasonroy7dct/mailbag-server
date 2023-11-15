// talks to an IMAP server to list mailboxes and messages and to retrieve messages

import { ParsedMail } from "mailparser";
const ImapClient = require("emailjs-imap-client");
import { simpleParser } from "mailparser";

import { IServerInfo } from "./ServerInfo";

// describe a mailbox and optionally a specific message
export interface ICallOptions {
    mailbox: string,
    id?: number
}

// describe a received message. 
// body is optional since it isn't sent when listing messages.
export interface IMessage {
    id: string,
    date: string,
    from: string,
    subject: string,
    body?: string
}

// describe a mailbox.
export interface IMailbox {
    name: string,
    // how code will identify a mailbox
    path: string 
}

// disable certificate validation for bypassing SSL certificate validation and proceed with the connection
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


export class Worker {
    private static serverInfo: IServerInfo;
    // the server information is passed in to the constructor and stored.
    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    } 

    /**
     * Connect to the SMTP server and return a emailjs-imap-client object for operations to use
     *
     * @return An ImapClient instance.
     */
    // The await keyword is used to wait for a promise to resolve or reject before continuing with the execution of the function
    // and will return a promise implicitly
    private async connectToServer(): Promise<any> {
        const client: any = new ImapClient.default(
            Worker.serverInfo.imap.host,
            Worker.serverInfo.imap.port,
            { auth: Worker.serverInfo.imap.auth }
        );
        client.logLevel = client.LOG_LEVEL_NONE;
        // error handler without re-trying
        client.onerror = (inError: Error) => {
            console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
        }; 
        await client.connect();
        return client;
    }


    /**
     * Returns a list of all (top-level) mailboxes
     *
     * @return An array of mailboxs
     */
    public async listMailboxes(): Promise<IMailbox[]> {
        const client: any = await this.connectToServer();
        const mailboxes: any = await client.listMailboxes();
        await client.close();

        // Translate from emailjs-imap-client mailbox objects to app-specific objects
        // At the same time, flatten the list of mailboxes to a one-dimensional array of objects via iterateChildren function recursion
        const finalMailboxes: IMailbox[] = [];
        const iterateChildren: Function = (inArray: any[]): void => {
            // For each mailbox encountered, added new object that contains name and path to finalMailboxes
            inArray.forEach((inValue: any) => {
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
    } 


    /**
     * Lists basic information about messages in a named mailbox
     *
     * @param inCallOptions An object implementing the ICallOptions interface
     * @return              An array of messages
     */
    public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
        const client: any = await this.connectToServer();
        // We have to select the mailbox first. This gives us the message count.
        // The inCallOptions object contain the name of the mailbox in mailbox field
        const mailbox: any = await client.selectMailbox(inCallOptions.mailbox);
        
        if (mailbox.exists === 0) {
            await client.close();
            return [];
        }

        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox, 
            // messages type: messages beginning with the first one and all messages after it. *: any value
            "1:*", 
            ["uid", "envelope"]
        );
        await client.close();
        // Translate from emailjs-imap-client message objects to app-specific objects.
        const finalMessages: IMessage[] = [];
        messages.forEach((inValue: any) => {
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
    } 


    /**
     * Gets the plain text body of a single message.
     *
     * @param  inCallOptions An object implementing the ICallOptions interface
     * @return               The plain text body of the message
     */
    public async getMessageBody(inCallOptions: ICallOptions): Promise<string> {
        const client: any = await this.connectToServer();
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox,
            inCallOptions.id, 
            ["body[]"], 
            { byUid: true }
        );
        // parses the message into a ParsedMail object
        const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]); 
        await client.close();
        return parsed.text!; 
    } 


    /**
     * Deletes message
     *
     * @param inCallOptions An object implementing the ICallOptions interface
     */
    public async deleteMessage(inCallOptions: ICallOptions): Promise<any> {
        const client: any = await this.connectToServer();
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox,
            inCallOptions.id, 
            ["uid"],
            { byUid: true }
        );
        if (inCallOptions.mailbox !== 'Deleted'){
            await client.copyMessages(
                inCallOptions.mailbox,
                messages[0]['uid'],
                'Deleted',
                { byUid: true }
            );
        }
        await client.deleteMessages(
            inCallOptions.mailbox,
            messages[0]['uid'],
            { byUid: true } 
        );
        await client.close(); 
    }

}