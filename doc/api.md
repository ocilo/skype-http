# API

## SkypeHttp

### Functions

#### connect

- options
  - type: {`ConnectOptions`}
- **return**
  - type: {`Bluebird<SkypeApi>`}

````typescript
export type ConnectOptions = {
  credentials?: {         // Create a new connection from credentials
    username: string;
    password: string;
  };
  state?: any;            // Restore a previous connection
  verbose?: boolean;      // Enable logging
}
````

---

## SkypeApi

### Methods

**TODO**
