import axios from "axios";

import { config } from "./config";

// SMTP is for sending data
// SMTP works between servers to transfer information
// SMTP allows organizing emails on client storage.
export class Worker {


  /**
   * Sand a message via SMTP
   *
   * @param inTo      The Email to send the message to
   * @param inFrom    The Email address it's from
   * @param inSubject The subject of the message
   * @param inMessage The message body
   */
  public async sendMessage(inTo: string, inFrom: string, inSubject: string, inMessage: string): Promise<void> {
    await axios.post(`${config.serverAddress}/messages`, { to : inTo, from : inFrom, subject : inSubject, text : inMessage
    });
  }
}
