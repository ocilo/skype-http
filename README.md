# Skype-Http

[![npm](https://img.shields.io/npm/v/skype-http.svg?maxAge=2592000)](https://www.npmjs.com/package/skype-http)
[![GitHub repository](https://img.shields.io/badge/Github-ocilo%2Fskype--http-blue.svg)](https://github.com/ocilo/skype-http)
[![Codecov](https://codecov.io/gh/ocilo/skype-http/branch/master/graph/badge.svg)](https://codecov.io/gh/ocilo/skype-http)
[![Build status](https://img.shields.io/travis/ocilo/skype-http/master.svg?maxAge=2592000)](https://travis-ci.org/ocilo/skype-http)
[![Greenkeeper badge](https://badges.greenkeeper.io/ocilo/skype-http.svg)](https://greenkeeper.io/)

Unofficial Skype API for Node.js via HTTP.
This relies on the Skype Web Application and requires the credentials of the account you want to use: use it with care.

## Installation

- Stable version:

  ````shell
  npm install --save skype-http
  ````

- Git master:

  ```shell
  npm install --save skype-http@next
  ```

Import for Typescript or Javascript ES6:
````typescript
import * as skypeHttp from "skype-http";
````

Import for Javascript ES5:
````javascript
var skypeHttp = require("skype-http");
````

## Quick start

The code below sends `Hello, World!` to all of `bob`'s contacts.  If bob's skype account was an MSA account(rather than older skype login) he would login with "bob@bobsdomain.com".

```typescript
import { Api, connect } from "skype-http";

async function run() {
  const api: Api = await connect({credentials: {username: "bob", password: "hunter2"}});
  for (const contact of await api.getContacts()) {
    await api.sendMessage({textContent: "Hello, World!"}, contact.mri);
  }
}

run();
```

## Running example

The demo will prompt you your username and password: you should use your Skype account or MSA.

````shell
git clone https://github.com/demurgos/skype-http
cd skype-http
# Ensure that you have the latest versions of the global dependencies
sudo npm install -g gulp-cli
npm install
npm start
````

This will perform a verbose connection (it should log the acquisition of various tokens), display the list of contacts,
set the status to `"Online"` and start to respond to messages.

## Documentation

[Old API documentation for the version 0.0.13](https://ocilo.github.io/skype-http/)

At the moment, documentation generation no longer works (we're waiting for Typedoc 0.10). So
I recommend to look at the example in `src/example` and library source code in `src/lib`,
especially the `api.ts` file and `types` directory.

Help is greatly appreciated if you want to help with documentation.

For Typescript, you should import types using `import { Contact } from "skype-http/types/contact"`,
etc. (`src/lib` is the root of the published package).

## Resources

If you just want to create a bot, take a look at <https://github.com/Microsoft/BotBuilder> first.

You can find the decompiled source code of the Skype Web Application on [the `skype-web-reversed` repository](https://github.com/demurgos/skype-web-reversed).

## What's not working and probably never will.

* [Old P2P group chats](https://github.com/ShyykoSerhiy/skyweb/issues/6). According to  [Skype community site ](http://community.skype.com/t5/Skype-for-Web-Beta/Group-chats-missing-on-skype-web/td-p/3884218) only new, Cloud based group chats are shown in SkypeWeb Beta(therefore works in this API). The old P2P group chats are not.  

## Project Background

This project started as a fork of the https://github.com/ShyykoSerhiy/skyweb after slow progress from 3rd party patches. The goal is to provide stronger guarantees about the objects returned by the API (through checks and normalization) and better error management, because scrapping/unofficial API calls are unreliable so the library should be resilient.

## Disclaimer 
This project relies on SkypeWeb Skype implementation. If Microsoft Corporation decides to remove Skype
implementation (or change it in any) skype-http might not be in working state. Therefore it's not recommended to use it 
in any critical part of production code. In fact it's not recommended to use it in production at all.

[MIT License](https://github.com/demurgos/skype-http/blob/master/LICENSE.md).
