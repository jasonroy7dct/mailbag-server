A mailbag application of UCI MSWE 250P Web Programming

## Computer Architecure and Framework Environment
MacBook Pro (14-inch, 2021)
macOS Monterey Version 12.5.1(21G83)
Node.js Version: v21.1.0 <br>
TypeScript Version: Version 4.8.4 <br>
React Version: 16.11.0 <br>

## Editor
Visual Studio Code Version: 1.82.2

## SMPT & IMAP settings reference
[Outlook SMTP & IMAP settings](https://support.microsoft.com/en-au/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040)
[Gmail SMTP & IMAP settings](https://developers.google.com/gmail/imap/imap-smtp)

## How to start mailbag application
server <br>
* Install dependencies by running `npm install` under server folder
* Choose on SMTP and IMAP portocal to follow, this application use Outlook
* Modify SMTP and IMAP server information for the personal email and app password in `serverInfo.json`
* Compile the project by running `npx tsc`
* Start the server by running `node dist/main.js`

client <br>
* Install dependencies by running `npm install` under client folder
* Modify server information for the personal email in `./src/code/config.ts `
* Start the client by running `npm run build`
* Access the application in http://localhost, dafault port is 80

## UI views
* Welcome Page<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Welcome.png" width="900"/><br/>

* Drafts<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Drafts.png" width="900"/><br/>

* Inbox<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Inbox.png" width="900"/><br/>

* New Message<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Message.png" width="900"/><br/>

* Contact<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Contact.png" width="900"/><br/>

* Update Contact<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/UpdateContact.png" width="900"/><br/>

* Junk<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Trash.png" width="900"/><br/>

* Sent<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Sent.png" width="900"/><br/>

* Reply<br>
<img src="https://github.com/jasonroy7dct/mailbag-server/blob/main/images/Reply.png" width="900"/><br/>

## Reference
Modern Full-Stack Development Using TypeScript, React, Node.js, Webpack and Docker. by Frank Zammetti
