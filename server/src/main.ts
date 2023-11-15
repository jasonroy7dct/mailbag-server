// the main entry point of the server APIs
import path from "path";

import express, { Express, NextFunction, Request, Response } from "express";

import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import { IContact } from "./Contacts";

// creates our Express app.
const app: Express = express();

// add middleware to Express with JSON in request body
app.use(express.json());

// Serve the client to a requested browser
// The static middleware is a built-in middleware for serving static resources
// __dirname is the directory the current script is in
app.use("/", express.static(path.join(__dirname, "../../client/dist")));

// Use CORS so that we can call the API
// CORS is a mechanism that allows or restricts the resources on a web page to be requested from another domain outside the domain from which the first resource was served
app.use(function (inRequest: Request, inResponse: Response, inNext: NextFunction) {
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
app.get("/mailboxes", 
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
            inResponse.status(200);
            inResponse.json(mailboxes);
        } catch (inError) {
            console.error("Error in /mailboxes endpoint:", inError);
            inResponse.status(500); // Internal Server Error
            inResponse.send("error");
        }
    }
);

// REST API Endpoint: List Mailboxes' messages
app.get("/mailboxes/:mailbox",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messages: IMAP.IMessage[] = await imapWorker.listMessages({
                mailbox: inRequest.params.mailbox
            });
            inResponse.status(200);
            inResponse.json(messages);
        } catch (inError) {
            console.error("Error in getting mailbox:", inError);
            inResponse.status(400).send("Error in getting mailbox");
        }
    }
);

// REST API Endpoint: Get Message
app.get("/messages/:mailbox/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messageBody: string = await imapWorker.getMessageBody({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10) 
            });
            inResponse.status(200);
            inResponse.send(messageBody);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST API Endpoint: Delete Message
app.delete("/messages/:mailbox/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            await imapWorker.deleteMessage({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10)
            });
            inResponse.status(200);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST API Endpoint: Send Message
app.post("/messages",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);

      // pre-condition check
      const { to, from, subject, text } = inRequest.body;
      if (!to || !from || !subject || !text) {
        inResponse.status(400).send("Missing required fields");
        return;
      }

      const result = await smtpWorker.sendMessage({ to, from, subject, text });
      inResponse.status(201).send(result);
    } catch (inError) {
      console.error("Error in sending mail:", inError);
      inResponse.status(400).send("Error in sending mail");
    }
  }
);


// REST API Endpoint: List Contacts
app.get("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: IContact[] = await contactsWorker.listContacts();
            inResponse.status(200);
            inResponse.json(contacts);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST API Endpoint: Add Contact
app.post("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.addContact(inRequest.body);
            inResponse.status(201);
            inResponse.json(contact);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST API Endpoint: Update Contact
app.put("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.updateContact(inRequest.body);
            inResponse.status(202);
            inResponse.json(contact);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST API Endpoint: Delete Contact
app.delete("/contacts/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            await contactsWorker.deleteContact(inRequest.params.id);
            inResponse.status(200);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);



// app listening on port 80
app.listen(80, () => {
    console.log("MailBag server open for requests");
});