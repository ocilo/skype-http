# Package

## Functions

### connect

````ts
skypeHttp.connect(options: ConnectOptions): Bluebird<Api>;
````

- options
  - Type: {`ConnectOptions`}
- **return**
  - Type: {`Bluebird`<[`Api`](./classes/api.md)>}

````ts
interface ConnectOptions {
  credentials?: {         // Create a new connection from credentials
    username: string;
    password: string;
  };
  state?: any;            // Restore a previous connection
  verbose?: boolean;      // Enable logging
}
````
