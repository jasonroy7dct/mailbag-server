// dealing with contacts, like listing, adding, and deleting them
// The data will be stored in a ole’ database on a server

import * as path from "path";
const Datastore = require("nedb")

// describe a contact
// id is optional for retrieving or adding
export interface IContact {
    _id?: number,
    name: string,
    email: string
}

export class Worker {
    // Nedb Datastore instance for contacts
    private db: Nedb;
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
    public listContacts(): Promise<IContact[]> {
        return new Promise((inResolve, inReject) => {
            // read the records in the contacts.db file
            this.db.find( 
                {},
                (inError: Error, inDocs: IContact[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });

    } 


    /**
     * Add a new contact
     *
     * @param  inContact The contact to add
     * @return           an IContact object.
     */
    public addContact(inContact: IContact): Promise<IContact> {
        return new Promise((inResolve, inReject) => {
            // add the object and the _id field
            this.db.insert(
                inContact,
                (inError: Error | null, inNewDoc: IContact) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inNewDoc);
                    }
                }
            );
        });
    } 

    /**
     * Update a contact 
     *
     * @param  inContact The contact to update 
     * @return           an IContact object
     */
     public updateContact(inContact: IContact): Promise<IContact> {
        return new Promise((inResolve, inReject) => {
            this.db.update(
                {_id : inContact._id},
                inContact,
                {returnUpdatedDocs: true},
                (inError: Error | null, numberOfUpdated: number, inDocs: IContact, upsert: boolean) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    } 


    /**
     * Delete a contact.
     *
     * @param  inID The ID of the contact to delete
     * @return      return null for success, or the error message for an error
     */
    public deleteContact(inID: string): Promise<string | void> {
        return new Promise((inResolve, inReject) => {
            this.db.remove(
                { _id: inID },
                {},
                (inError: Error | null, inNumRemoved: number) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve();
                    }
                }
            );
        });
    } 
}