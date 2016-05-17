# Api

## Summary

- Methods
  - [acceptContactRequest](#acceptContactRequest)
  - [declineContactRequest](#declineContactRequest)
  - [getContacts](#getContacts)
  - [sendMessage](#sendMessage)
  - [setStatus](#setStatus)

## Methods

### acceptContactRequest

````ts
acceptContactRequest(contactUsername: string): Bluebird<this>;
````

- `contactUsername`
  - Type: {`string`}
- **returns**
  - Type: {`Bluebird`<[`Api`](#)>}

Accepts the contact request from `contactUsername`.

### declineContactRequest

````ts
declineContactRequest(contactUsername: string): Bluebird<this>;
````

- `contactUsername`
  - Type: {`string`}
- **returns**
  - Type: {`Bluebird`<[`Api`](#)>}

Declines the contact request from `contactUsername`.

### getContacts

````ts
getContacts(): Bluebird<Contact[]>;
````

- **returns**
  - Type: {`Bluebird`<[`Contact[]`](../interfaces/contact.md)>}

Get the list of contacts of the current user.

### sendMessage

````ts
sendMessage (message: NewMessage, conversationId: string): Bluebird<any> 
````

- message
  - Type: {`NewMessage`}
  
  Where `NewMessage` is:
  ````ts
  interface NewMessage {
    textContent: string;
  }
  ````

- discussionId
  - Type: {`string`}

- **returns**
  - Type: {`Bluebird`<`any`>}

Sends a message on the conversation defined by `discussionId`.

### setStatus

````ts
setStatus (status: string): Bluebird<any> 
````

- status
  - Type: {`"Away"` | `"Busy"` | `"Hidden"` | `"Online"`}
- **returns**
  - Type: {`Bluebird`<`any`>}

Sends the status for the current endpoint.

## Events

**TODO**
