# 0.0.15 (2018-02-14)

- **[Feature]** Add `setConversationTopic(conversationId: string, topic: string)`
- **[Feature]** Add `getJoinUrl(conversationId: string)`
- **[Feature]** Add `addMemberToConversation(conversationId: string, memberId: string)`
- **[Feature]** Add `createConversation(allUsers: AllUsers)`
- **[Fix]** Do not throw on unexpected extra keys when reading responses.
- **[Fix]** Fix message host resolution (API change).
- **[Fix]** Mark `isFavorite` in `ContactGroup` as optional.
- **[Fix]** Mark `name` in `ContactProfile` as optional.
- **[Fix]** Move `.ts` sources to a different directory than `.d.ts` and `.js` in dist build
- **[Internal]** Run tests and coverage on `.mjs` files.

# 0.0.14 (2018-01-12)

- **[Breaking change]** Use contacts API v2: the new types are in `lib/types`, the old types
    remain in `lib/interfaces`. The main difference is that the MRI key (`8:user_id`) is no longer
    parsed and most of the contact details are now in a `Profile` object.
    It is no longer possible to get a single contact.
- **[Feature]** Expose detailed errors for endpoint registration.
- **[Feature]** Support ES modules (ESM)
- **[Fix]** Add support email login (#58)
- **[Internal]** Update project tools to [turbo-gulp](https://www.npmjs.com/package/turbo-gulp)
- **[Internal]** Enable integration with Codecov
- **[Internal]** Enable integration with Greenkeeper
- **[Internal]** Use runtime representation of the types with Kryo

# 0.0.13 (2017-07-16)

- **[Breaking]** Allow `Contact.name.first` and `Contact.surname.first` to be null. This matches the Skype
  API.
- **[Feature]** Send images with the new `sendImage` method
- **[Feature]** Add support for state serialization. This allows you to export the state and then restore it.
- **[Internal]** Add background information about the project and update the commands available to contributors.
- **[Internal]** Add TypeDoc generation.

# 0.0.12 (2017-05-10)

- **[Breaking]** Require ES2015 (ES6) objects. If you use it an a browser, include a shim
- **[Feature]** Strongly typed login errors. You can now receive a
  `errors.microsoftAccount.MicrosoftLoginError` when trying to login. This error contains a cause
  that explains the issue (take a look at the `src/errors` directory). Some of the
  errors that are detected include invalid credentials and login limits.
- **[Patch]** Drop dependency on `typings`. Solves some installation issues.
- **[Patch]** Fix missing dependency on `incident` in `package.json`.
- **[Internal]** Update `tslint` to version 8 (enforce trailing comma for multiline objects).
- **[Internal]** Require successful `gulp :lint` to commit.
- **[Internal]** Rename the main module to `index` in `src/lib`.

# 0.0.11 (2017-05-09)

- **[Patch]** Use Microsoft accounts for connection
- **[Patch]** Update `main` in `package.json` to point to the correct file.
- **[Internal]** Update dependencies. Drop dependency on `bluebird` in favor of
  native promises and `async`/`await`.

# 0.0.10

- **[Internal]** Create `CHANGELOG.md`
