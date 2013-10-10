# level-json-edit [![build status](https://secure.travis-ci.org/thlorenz/level-json-edit.png)](http://travis-ci.org/thlorenz/level-json-edit)

Taking editing json to the next level with multilevel.

## Status

Fairly well tested, but still **in beta**.

Lots of API may change (especially event names), and missing documentation needs to be added.

Additionally the example is currently incomplete.

## Installation

    npm install level-json-edit

## API

### ServerSide

####*function (server, config, authentication)*

```
/**
 * Initializes server side end of level-json-edit.
 *
 * @name exports
 * @function
 * @param server
 * @param config {Object} with the following properties:
 *  - dbPath {String} path to level db
 *  - isIndex {Function} should return true if prefix is for a sublevel that is an index, otherwise false
 *  - dataPrefix {String} the prefix of the sublevel that contains the json data
 *  - endpoint {String} ('/engine') any common string that server and client use to connect multilevel
 *  - mixin {Function} (optional) mixin extra functionality into the db, i.e. install a level-live-stream
 *  @param authentication {Object} passed to multilevel server creation (https://github.com/juliangruber/multilevel#authentication)
 *  - auth: {Function} to authenticate user
 *  - access: {Function} called when db is accessed with particular method, throw Error if user is not authorized
 */
```

### Client Side

####*function (opts, containers)*

```
/**
 * Initializes the client side part of level-json-editor
 * 
 * @name exports
 * @function
 * @param opts {Object}
 *  - isIndex {Function} should return true if sublevel is an index, false if not
 *  - valiate {Function} (optional) return false if the data about to be saved is not valid
 *, - dataPrefix {String} the prefix of the sublevel holding the data
 * @param containers {Object}
 *  - indexes {DOMElement} will hold the db indexes
 *  - editor {DOMElement} will hold the actual data editor
 *  - saveButton {DOMElement} will hold the button which will save the edited data
 *  @return {Object} with the following properties:
 *    - on {Function} allows subscribing to various events
 *    - indexes {Object} the indexes viewer (json-editor)
 *    - editor {Object} the data editor (json-editor)
 *    - refreshIndexes {Function} refreshes the indexes view with the current data in index sublevels and calls back when finished
 */
```

## License

MIT
