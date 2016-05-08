# Skype-Http

[![npm](https://img.shields.io/npm/v/skype-http.svg?maxAge=2592000)](https://www.npmjs.com/package/skype-http)
[![Build status](https://img.shields.io/travis/demurgos/skype-http/master.svg?maxAge=2592000)](https://travis-ci.org/demurgos/skype-http)

Unofficial Skype API for Node.js via HTTP.
This relies on the Skype Web Application and requires the credentials of the account you want to use: use it with care.

## Installation

````shell
npm install --save skype-http

# If you use Typescript, install the definitions with:
typings install --save npm:skype-http
````

Import for Typescript or Javascript ES6:
````typescript
import {Skyweb} from "skype-http";
````

Import for Javascript ES5:
````js
var Skyweb = require("skype-http").Skyweb;
````

## Running example

The demo will prompt you your username and password: you should use your Skype account (there is no support for Microsoft account for now).

```shell
git clone https://github.com/demurgos/skype-http
cd skype-http
npm install && typings install
npm run demo
```
After 'Skyweb is initialized now' appears in console any message you receive in your Skype will be automatically replied.

## Usage

### Initializing and login
```js
Skyweb = require('skyweb');
var skyweb = new Skyweb();
skyweb.login(username, password).then(function (skypeAccount) {
    console.log('Skyweb is initialized now');
});
```

### Getting contacts info
```js
var skyweb = new Skyweb();
skyweb.login(username, password).then((skypeAccount) => {    
    console.log('Your contacts : ' + JSON.stringify(skyweb.contactsService.contacts, null, 2));
});
```

### Setting status
```js
var skyweb = new Skyweb();
skyweb.login(username, password).then((skypeAccount) => {
    skyweb.setStatus('Hidden'); //Now everybody thinks I'm sleeping
});
```
Currently supported values are : "Hidden" | "Online" | "Away" | "Busy"

## npm scripts

### `build`

Compiles the core files to `build/local`.

### `clean`

Removes the `build` and `dist` directories

### `demo`

Compiles the demo to `build/demo` and runs the main demo file.

### `lint`

Checks the source files with `tslint`

### `prepare`

Installs `typings` definitions.

### `prepublishOnly`

Clean the directories, run linter and tests and if everything is fine, compile the core files and moves them to the `dist` directory to be published on `npm`.

### `publishOnly`

Runs `prepublishOnly` and then `npm publish`. This is a temporary fix until [this npm issue](https://github.com/npm/npm/issues/10074) is solved.

### `test`

Lint the source files and runs the specs.
This is executed during Travis CI builds.

## Resources

If you just want to create a bot, take a look at https://github.com/Microsoft/BotBuilder first.

You can find the decompiled source code of the Skype Web Application on [the `skype-web-reversed` repository](https://github.com/demurgos/skype-web-reversed).

## What's not working and probably never will.
* [Old P2P group chats](https://github.com/ShyykoSerhiy/skyweb/issues/6). According to  [Skype community site ](http://community.skype.com/t5/Skype-for-Web-Beta/Group-chats-missing-on-skype-web/td-p/3884218) only new, Cloud based group chats are shown in SkypeWeb Beta(therefore works in this API). The old P2P group chats are not.  

## Disclaimer 
This project relies on SkypeWeb Skype implementation. If Microsoft Corporation decides to remove Skype
implementation (or change it in any) skyweb might not be in working state. Therefore it's not recommended to use it 
in any critical part of production code. In fact it's not recommended to use it in production at all.

[MIT License](https://github.com/demurgos/skype-http/blob/master/LICENSE.md).
