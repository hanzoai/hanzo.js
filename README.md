# crowdstart.js  [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url]  [![Gitter chat][gitter-image]][gitter-url]
<!-- [![Downloads][downloads-image]][downloads-url] -->

Full-featured JavaScript SDK for Crowdstart. Node.js and browser.

## Install
```bash
$ npm install crowdstart.js
```

## Usage
```javascript
var api = Crowdstart.Api({key: key});

var user = api.account.create({
    firstName: 'Mr.',
    lastName:  'T',
    email:     'mrt@a-team.com',
}).then(function(user) {
    api.account.get()
}).then(function(account) {
    console.log(account)
})
```


[travis-url]: https://travis-ci.org/crowdstart/crowdstart.js
[travis-image]: https://img.shields.io/travis/crowdstart/crowdstart.js.svg
[coveralls-url]: https://coveralls.io/r/crowdstart.js/crowdstart.js/
[coveralls-image]: https://img.shields.io/coveralls/crowdstart.js/crowdstart.js.svg
[npm-url]: https://www.npmjs.com/package/crowdstart.js
[npm-image]: https://img.shields.io/npm/v/crowdstart.js.svg
[downloads-image]: https://img.shields.io/npm/dm/crowdstart.js.svg
[downloads-url]: http://badge.fury.io/js/crowdstart.js
[gitter-url]: https://gitter.im/crowdstart/chat
[gitter-image]: https://img.shields.io/badge/gitter-chat-brightgreen.svg
