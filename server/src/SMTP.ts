import Mail from "nodemailer/lib/mailer";
import * as nodemailer from "nodemailer";
import { SendMailOptions, SentMessageInfo } from "nodemailer";

import { IServerInfo } from "./ServerInfo";

// SMTP is for sending data
// SMTP works between servers to transfer information
// SMTP allows organizing emails on client storage.
export class Worker {

    private static serverInfo: IServerInfo;

    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    }

    /**
     * Send a message.
     *
     * @param  inOptions The parameters of to, from, subject and text properties 
     * 
     * @return           string, null for success, error message for an error
     */
    public sendMessage(inOptions: SendMailOptions): Promise<string | void> {
        // wrapped up in the Promise object to implement async and await
        return new Promise((inResolve, inReject) => {
            // use transport to send mail with the protocol
            const transport: Mail = nodemailer.createTransport(Worker.serverInfo.smtp);
            transport.sendMail(
                inOptions,
                (inError: Error | null, inInfo: SentMessageInfo) => {
                    if (inError) {
                        inReject(inError.message || "Failed to send mail");
                    } else {
                        inResolve("Mail sent successfully");
                    }
                }
            );
        });

    }
} 