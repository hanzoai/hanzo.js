# crowdstart.js [![Build Status](https://travis-ci.org/crowdstart/crowdstart.js.svg?branch=master)](https://travis-ci.org/crowdstart/crowdstart.js) [![npm version](https://badge.fury.io/js/crowdstart.js.svg)](https://badge.fury.io/js/crowdstart.js)
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
