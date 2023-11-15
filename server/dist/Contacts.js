"use strict";
// dealing with contacts, like listing, adding, and deleting them
// The data will be stored in a ole’ database on a server
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const path = __importStar(require("path"));
const Datastore = require("nedb");
class Worker {
    constructor() {
        this.db = new Datastore({
            // configure the db path
            filename: path.join(__dirname, "contacts.db"),
            // load automatically
            autoload: true
        });
    }
    /**
     * Lists all contacts
     *
     * @return an array of IContact objects
     */
    listContacts() {
        return new Promise((inResolve, inReject) => {
            // read the records in the contacts.db file
            this.db.find({}, (inError, inDocs) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inDocs);
                }
            });
        });
    }
    /**
     * Add a new contact
     *
     * @param  inContact The contact to add
     * @return           an IContact object.
     */
    addContact(inContact) {
        return new Promise((inResolve, inReject) => {
            // add the object and the _id field
            this.db.insert(inContact, (inError, inNewDoc) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inNewDoc);
                }
            });
        });
    }
    /**
     * Update a contact
     *
     * @param  inContact The contact to update
     * @return           an IContact object
     */
    updateContact(inContact) {
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: inContact._id }, inContact, { returnUpdatedDocs: true }, (inError, numberOfUpdated, inDocs, upsert) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inDocs);
                }
            });
        });
    }
    /**
     * Delete a contact.
     *
     * @param  inID The ID of the contact to delete
     * @return      return null for success, or the error message for an error
     */
    deleteContact(inID) {
        return new Promise((inResolve, inReject) => {
            this.db.remove({ _id: inID }, {}, (inError, inNumRemoved) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve();
                }
            });
        });
    }
}
exports.Worker = Worker;
//# sourceMappingURL=Contacts.js.map