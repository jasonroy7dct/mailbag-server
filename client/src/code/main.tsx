// import css for the styling
import "normalize.css"; 
import "../css/main.css";

import React from "react";
import ReactDOM from "react-dom";

import BaseLayout from "./components/BaseLayout";
import * as IMAP from "./IMAP";
import * as Contacts from "./Contacts";


// rendering the BaseLayout component
const baseComponent = ReactDOM.render(<BaseLayout />, document.body);

baseComponent.state.showHidePleaseWait(true);
// call the server and get a list of mailboxes
async function getMailboxes() {
  const imapWorker: IMAP.Worker = new IMAP.Worker();
  const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
  mailboxes.forEach((inMailbox) => {
    // update the mailboxes array in state
    baseComponent.state.addMailboxToList(inMailbox); 
  });
}
getMailboxes().then(function() {
  // get the user's contacts.
  async function getContacts() {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contacts: Contacts.IContact[] = await contactsWorker.listContacts();
    contacts.forEach((inContact) => {
      baseComponent.state.addContactToList(inContact);
    });
  }
  getContacts().then(() => baseComponent.state.showHidePleaseWait(false));
});
