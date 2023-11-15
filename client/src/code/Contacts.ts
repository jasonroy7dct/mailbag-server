import axios, { AxiosResponse } from "axios";

import { config } from "./config";

// describe a contact, id is optional
export interface IContact { 
  _id?: number, name: string, email: string 
}

export class Worker {

  /**
   * Returns a list of all contacts from the server
   *
   * @return an array of contacts
   */
  public async listContacts(): Promise<IContact[]> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/contacts`);
    return response.data;
  } 


  /**
   * Add a contact to the server
   *
   * @param  inContact The contact to add
   * @return           The inContact object but now with a _id field added
   */
  public async addContact(inContact: IContact): Promise<IContact> {
    // passing inContact as the second argument. Axios takes care of serializing that to JSON
    const response: AxiosResponse = await axios.post(`${config.serverAddress}/contacts`, inContact);
    return response.data;
  }

  /**
   * Update a contact to the server.
   *
   * @param  inContact The contact to update
   * @return           The inContact object
   */
  public async updateContact(inContact: IContact): Promise<IContact> {
    const response: AxiosResponse = await axios.put(`${config.serverAddress}/contacts`, inContact);
    return response.data;
  } 

  /**
   * Delete a contact from the server
   *
   * @param inID
   */
  public async deleteContact(inID): Promise<void> {
    await axios.delete(`${config.serverAddress}/contacts/${inID}`);
  }
}
