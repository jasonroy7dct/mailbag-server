import axios, { AxiosResponse } from "axios";

import { config } from "./config";


// describe a mailbox
export interface IMailbox { name: string, path: string }

// describe a received message, body is optional
export interface IMessage {
  id: string,
  date: string,
  from: string,
  subject: string,
  body?: string
}

// IMAP is used to retrieve messages
// IMAP works between the server and client for communication
// IMAP allows users to organize emails onto the server
export class Worker {

  /**
   * Returns a list of all (top-level) mailboxes
   *
   * @return An array of mailboxs
   */
  public async listMailboxes(): Promise<IMailbox[]> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes`);
    return response.data;
  }


  /**
   * Returns a list of messages in a named mailbox
   *
   * @param  inMailbox The name of the mailbox
   * @return           An array of messages
   */
  public async listMessages(inMailbox: string): Promise<IMessage[]> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes/${inMailbox}`);
    return response.data;
  }


  /**
   * Returns the body of a specified message.
   *
   * @param  inID      The ID of the message
   * @param  inMailbox The name of the mailbox
   * @return           The body of the message
   */
  public async getMessageBody(inID: string, inMailbox: String): Promise<string> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/messages/${inMailbox}/${inID}`);
    return response.data;
  }


  /**
   * Returns the body of a specified message
   *
   * @param  inID      The ID of the message
   * @param  inMailbox The name of the mailbox
   */
  public async deleteMessage(inID: string, inMailbox: String): Promise<void> {
    await axios.delete(`${config.serverAddress}/messages/${inMailbox}/${inID}`);
  }
}
