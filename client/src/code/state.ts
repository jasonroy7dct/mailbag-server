import * as Contacts from "./Contacts";
import { config } from "./config";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";

export function createState(inParentComponent: any) {

  return {

    pleaseWaitVisible: false,

    contacts: [],

    mailboxes: [],

    messages: [],

    // default view
    currentView: "welcome", 

    // currently selected mailbox
    currentMailbox: null,

    // what state is necessary when either viewing or creating a message
    // messageID would only ever be populated when viewing an existing message, and it’s the ID of the message on the server
    messageID: null,
    messageDate: null,
    messageFrom: null,
    messageTo: null,
    messageSubject: null,
    messageBody: null,

    // The details of the contact
    contactID: null,
    contactName: null,
    contactEmail: null,

    /**
     * serve the purpose of blocking the UI for a moment so that the user can’t go and do something 
     * that causes problems while the server works
     *
     * @param inVisible
     */
    showHidePleaseWait: function (inVisible: boolean): void {

      this.setState({ pleaseWaitVisible: inVisible });

    }.bind(inParentComponent),


    /**
     * Show ContactView in view mode.
     *
     * @param inID    
     * @param inName 
     * @param inEmail 
     */
    showContact: function (inID: string, inName: string, inEmail: string): void {

      this.setState({ currentView: "contact", contactID: inID, contactName: inName, contactEmail: inEmail });

    }.bind(inParentComponent),


    /**
     * Show ContactView in add mode
     * the contact won’t have an ID until we save it to the server, so contactID is null
     */
    showAddContact: function (): void {

      this.setState({ currentView: "contactAdd", contactID: null, contactName: "", contactEmail: "" });

    }.bind(inParentComponent),


    /**
     * Show MessageView in view mode
     *
     * @param inMessage The message object that was clicked.
     */
    showMessage: async function (inMessage: IMAP.IMessage): Promise<void> {

      this.state.showHidePleaseWait(true);
      const imapWorker: IMAP.Worker = new IMAP.Worker();
      const mb: String = await imapWorker.getMessageBody(inMessage.id, this.state.currentMailbox);
      this.state.showHidePleaseWait(false);

      this.setState({
        currentView: "message",
        messageID: inMessage.id, messageDate: inMessage.date, messageFrom: inMessage.from,
        messageTo: "", messageSubject: inMessage.subject, messageBody: mb
      });

    }.bind(inParentComponent),


    /**
     * Show MessageView in compose mode
     *
     * @param inType Pass "new" if this is a new message, "reply" if it's a reply to the message currently being
     *                    viewed, and "contact" if it's a message to the contact currently being viewed.
     */
    showComposeMessage: function (inType: string): void {

      switch (inType) {

        case "new":
          this.setState({
            currentView: "compose",
            messageTo: "", 
            messageSubject: "", 
            messageBody: "",
            messageFrom: config.userEmail
          });
          break;

        // get the messageTo, messageSubject, and messageBody variables from state
        case "reply":
          this.setState({
            currentView: "compose",
            messageTo: this.state.messageFrom, 
            messageSubject: `Re: ${this.state.messageSubject}`,
            messageBody: `\n\n---- Original Message ----\n\n${this.state.messageBody}`, 
            messageFrom: config.userEmail
          });
          break;

        // get the messageTo from the contact
        case "contact":
          this.setState({
            currentView: "compose",
            messageTo: this.state.contactEmail, 
            messageSubject: "",
            messageBody: "",
            messageFrom: config.userEmail
          });
          break;

      }

    }.bind(inParentComponent),

    /**
     * Add a mailbox to the list of mailboxes
     *
     * @param inMailbox the name of the mailbox
     */
    addMailboxToList: function (inMailbox: IMAP.IMailbox): void {

      // copy the list
      const cl: IMAP.IMailbox[] = this.state.mailboxes.slice(0);

      // push the new mailbox
      cl.push(inMailbox);

      // update list in state.
      this.setState({ mailboxes: cl });

    }.bind(inParentComponent),


    /**
     * Add a contact to the list of contacts
     *
     * @param inContact the name of the contact 
     */
    addContactToList: function (inContact: Contacts.IContact): void {
      const cl = this.state.contacts.slice(0);
      // add new element explicitly
      cl.push({ _id: inContact._id, name: inContact.name, email: inContact.email });
      this.setState({ contacts: cl });

    }.bind(inParentComponent),


    /**
     * Add a message to the list of messages in the current mailbox
     *
     * @param inMessage the message body
     */
    addMessageToList: function (inMessage: IMAP.IMessage): void {

      const cl = this.state.messages.slice(0);

      cl.push({ id: inMessage.id, date: inMessage.date, from: inMessage.from, subject: inMessage.subject });

      this.setState({ messages: cl });

    }.bind(inParentComponent),


    /**
     * Clear the list of messages currently displayed, set it to blank array
     */
    clearMessages: function (): void {
      this.setState({ messages: [] });

    }.bind(inParentComponent),

    /**
     * Set the current mailbox
     *
     * @param inPath The path of the current mailbox
     */
    setCurrentMailbox: function (inPath: String): void {
      // dafault welcome view
      this.setState({ currentView: "welcome", currentMailbox: inPath });

      this.state.getMessages(inPath);

    }.bind(inParentComponent),


    /**
     * Get a list of messages in the currently selected mailbox, if any.
     *
     * @param inPath The path to the mailbox to get messages for.  Note that because this method is called when the
     *               current mailbox is set, we can't count on state having been updated by the time this is called,
     *               hence why the mailbox is passed in. This avoids the problem with setState() being asynchronous.
     */
    getMessages: async function (inPath: string): Promise<void> {
      this.state.showHidePleaseWait(true);
      const imapWorker: IMAP.Worker = new IMAP.Worker();
      const messages: IMAP.IMessage[] = await imapWorker.listMessages(inPath);
      this.state.showHidePleaseWait(false);

      // clear any current list of messages
      this.state.clearMessages(); 
      messages.forEach((inMessage: IMAP.IMessage) => {
        this.state.addMessageToList(inMessage);
      });

    }.bind(inParentComponent),


    /**
     * Handle changes in editable fields
     * This handler is used on all the editable fields in MailBag
     *
     * @param inEvent The event object generated by the keypress
     */
    fieldChangeHandler: function (inEvent: any): void {
      // check the max length for contact name
      if (inEvent.target.id === "contactName" && inEvent.target.value.length > 16) { return; }

      this.setState({ [inEvent.target.id]: inEvent.target.value });

    }.bind(inParentComponent),


    /**
     * Save contact.
     */
    saveContact: async function (): Promise<void> {

      const cl = this.state.contacts.slice(0);

      // add to the server
      this.state.showHidePleaseWait(true);
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contact: Contacts.IContact =
        await contactsWorker.addContact({ name: this.state.contactName, email: this.state.contactEmail });
      this.state.showHidePleaseWait(false);

      cl.push(contact);

      this.setState({ contacts: cl, contactID: null, contactName: "", contactEmail: "" });

    }.bind(inParentComponent),


    /**
     * Delete the currently viewed contact.
     */
    deleteContact: async function (): Promise<void> {

      // delete from server
      this.state.showHidePleaseWait(true);
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      await contactsWorker.deleteContact(this.state.contactID);
      this.state.showHidePleaseWait(false);

      // use filter to remove the id from list
      const cl = this.state.contacts.filter((inElement) => inElement._id != this.state.contactID);

      this.setState({ contacts: cl, contactID: null, contactName: "", contactEmail: "" });

    }.bind(inParentComponent),

    /**
     * update the currently viewed contact
     */
    updateContact: async function (this: any): Promise<void> {

      this.state.showHidePleaseWait(true);
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contact: Contacts.IContact =
        await contactsWorker.updateContact({ _id: this.state.contactID, name: this.state.contactName, email: this.state.contactEmail });
      this.state.showHidePleaseWait(false);

      // remove from list and push the new one
      const cl = this.state.contacts.slice(0);
      const new_cl = cl.filter((inElement: any) => inElement._id != this.state.contactID);
      new_cl.push(contact);

      this.setState({ contacts: new_cl, contactID: contact._id, contactName: contact.name, contactEmail: contact.email });

    }.bind(inParentComponent),

    /**
     * Delete the currently viewed message.
     */
    deleteMessage: async function (): Promise<void> {

      // delete from server
      this.state.showHidePleaseWait(true);
      const imapWorker: IMAP.Worker = new IMAP.Worker();
      await imapWorker.deleteMessage(this.state.messageID, this.state.currentMailbox);
      this.state.showHidePleaseWait(false);

      // use filter to remove the id from list
      const cl = this.state.messages.filter((inElement: any) => inElement.id != this.state.messageID);

      // update the state
      this.setState({ messages: cl, currentView: "welcome" });

    }.bind(inParentComponent),


    /**
     * Send a message
     */
    sendMessage: async function (): Promise<void> {

      this.state.showHidePleaseWait(true);
      const smtpWorker: SMTP.Worker = new SMTP.Worker();
      await smtpWorker.sendMessage(this.state.messageTo, this.state.messageFrom, this.state.messageSubject, this.state.messageBody);
      this.state.showHidePleaseWait(false);

      this.setState({ currentView: "welcome" });

    }.bind(inParentComponent)
  };
}
