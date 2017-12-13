# Hanzo.js

[![npm][npm-img]][npm-url]
[![build][build-img]][build-url]
[![dependencies][dependencies-img]][dependencies-url]
[![downloads][downloads-img]][downloads-url]
[![license][license-img]][license-url]
[![chat][chat-img]][chat-url]

> JavaScript SDK for [Hanzo][hanzo]

Hanzo.js is a client and server-side library for [Hanzo][hanzo]. It is a
complete Ecommerce SDK for JavaScript.

With it you can:
- Launch static sites to test new ideas or reach additional markets.
- Gather detailed analytics about your users and their behavior.
- Acquire, on-board and keep users.
- Collect payments and create subscriptions for products, software or services.
- Manage orders, shipping and fulfillment for products.
- Run referral programs and other incentive-based programs for your business.

## Install
```bash
$ npm install hanzo.js
```

## Usage
You can embed Hanzo.js in your application or web page or on the server
with Node.  Getting started is easy: you just need an API key from
[Hanzo][hanzo] and a snippet of JavaScript to get going.

### Browser
Include [`hanzo.js`][hanzo.js] in your website or bundle it with your
JavaScript application using your favorite build tool. All account and commerce
related APIs are available in the browser making it possible to launch an
ecommerce site without building, maintaining or securing any backend services.

```html
<script src="https://cdn.rawgit.com/hanzoai/hanzo.js/v2.2.8/hanzo.min.js"></script>
<script>
var api = new Hanzo.Api({key: yourPublishedKey});
</script>
```

Make sure you use your published key and not your secret key!

### Node
You can use either a published or secret key with the Node client. A secret key
is required for full use of the Hanzo API.

```javascript
Hanzo = require('hanzo.js');
var api = new Hanzo({key: yourSecretKey});
```

### JavaScript API
Promises are returned by every asynchronous method when a callback is not
provided. Error-first callbacks are optional to every asynchronous method and
may be used interchangeably with the Promise-based API.

#### Promise style
Full Promise A+ compliant promises are returned by every API method call.

```javascript
var promise = api.account.create({});

promise
  .then(success)
  .catch(failure)
```

#### Callback style
Node.js-style error first callbacks can also be supplied.

```javascript
api.account.create({}, function(err, user) {
    // ...etc
});
```

## API

### new Hanzo.Api(opts)
Create a new Hanzo API Client. Has a high level API which returns objects
directly.

##### Arguments
- `opts` Options, optional
    - `key` Key to use during requests.
    - `endpoint` Defaults to `'https://api.hanzo.io'`

### new Hanzo.Client(opts)
Lower-level client which `Api` builds on. You can direct requests to Hanzo
using blueprints.

##### Arguments
- `opts` Options, optional
    - `key` Key to use during requests.
    - `endpoint` Defaults to `'https://api.hanzo.io'`

#### client.request(blueprint [, data, key])
Make a request using `blueprint`. Returns a promise which eventually returns a
response object or rejects with an `Error`.

##### Blueprints
A `blueprint` is a description of an API method including URL, method, etc. You
can re-use the default blueprints pretty easily to make your own requests directly.

```javascript
client.request(api.account.create, {email: '', ...})
    .then(function(res) {
        console.log(res.data)
        console.log(res.status)
    })
    .catch(function(err) {
        console.log(err.stack)
    })
```

##### Arguments
- `blueprint` Description of API endpoint.
- `data` Data to send to Hanzo.
- `key` Key to use during requests.

## Browser API
We only expose a subset of API methods to the Browser. Only the API calls which
are possible with a publishable token or user token are available.

### Account
Account API encompasses our authentication, login, and user creation APIs.

#### account.create(user [, callback])
This method creates a new user. It has more strict validation than the standard
`user` API and will send welcome emails if configured.

##### Arguments
- [`user`][user], required.
    - `firstName` string, required.
    - `lastName` string, required.
    - `email` string, required.
    - `password` string, required.
    - `passwordConfirm` string, required.
- `callback`, optional.

##### Returns
- [`user`][user]

#### account.enable(token [, callback])
This method enable's a user account after creation using token provided in email.

##### Arguments
- `token` string, required.  This is the token that comes in when a user clicks the confirm email in their inbox.
- `callback`, optional

##### Returns
- boolean

#### account.get([callback])
This method returns account information for currently logged in user.

##### Arguments
- `callback`, optional

##### Returns
- [`user`][user]

#### account.exists(identifier [, callback])
This method checks to see if a exists, as per the identifier.

##### Arguments
- `identifier` string, required.  Can be a user's email, username, or unique id.
- `callback`, optional

##### Returns
- boolean

#### account.login(user [, callback])
This method logs in a user and sets a user token on the client for subsequent
calls.

##### Arguments
- [`user`][user], required.
    - `email` string, required.
    - `password` string, required.
- `callback`, optional.

##### Returns
- [`user`][user]

#### account.logout([callback])
This method destroys the current user session.

##### Arguments
- `callback`, optional.

##### Returns
- null

#### account.reset(reset [, callback])
This method starts the account reset process (such as if a user has forgotten their password)

##### Arguments
- `reset`, required, contains the following key:
    - `email`, string, required
- `callback`, optional

##### Returns
- null

#### account.confirm(tokenId [, callback])
This method completes the account reset process by confirming it with the ID garnished from the user's email.

##### Arguments
- `tokenId` string, required
- `callback`, optional

##### Returns
- null

#### account.update(user [, callback])
This method updates a user with new information.  All fields in the [`user`][user] object are optional,
but the ones given will overwrite whatever was there before.

##### Arguments
- [`user`][user], required.
    - `firstName` string, optional
    - `lastName` string, optional
    - `phone` string, optional
    - `billingAddress` string, optional
    - `shippingAddress` string, optional
    - `email` string, optional
- `callback`, optional.

##### Returns
- [`user`][user]

### Checkout
Checkout encompasses the actual purchase of things from your website, and has support for both
one and two step payment styles.

#### checkout.charge(opts [, callback])
This is the one-step payment process, which will attempt to both authorize and capture the payment
at the same time.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
    - [`payment`][payment], payment information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.

#### checkout.authorize(opts [, callback])
This is the first half of the two-step payment process, and will authorize the payment for later capture.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
    - [`payment`][payment], payment information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.

#### checkout.capture(opts [, callback])
This is the first half of the two-step payment process, and will capture a payment that has been authorized prior.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
    - [`payment`][payment], payment information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.

#### checkout.paypal(opts [, callback])
This initiates a PayPal payment.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.  `PayKey` is added to the order to allow for appropriate redirection to PayPal's site.

### Collection
This describes a bundle of products that are bunched together for a specific sale.

#### collection.get(id, [, callback])
This gets the information of a collection with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`collection`][collection], the collection information.

#### collection.list([callback])
This lists all the collections available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`collection[]`][collection], an array of available collections.

### Coupon
This is an entity that allows for special offers to be posted through your online store.

#### coupon.get(id [, callback])
This gets the information of a coupon with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`coupon`][coupon], coupon information.

#### coupon.list([callback])
This lists all the coupons available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`coupon[]`][coupon], an array of available coupons.

### Product
This is an entity that represents the things that are on offer at your site.

#### product.get(id [, callback])
This gets the information of a product with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`product`][product], product information.

#### product.list([callback])
This lists all the products available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`product[]`][product], an array of available products.

### Variant
This is an entity that represents a variation of a product that is available on your site.

#### variant.get(id [, callback])
This gets the information of a variant with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`variant`][variant], variant information.

#### variant.list([callback])
This lists all the variants available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`variant[]`][variant], an array of available variants.


## Server API
You have pretty much complete access to Hanzo from your own server with a
secret key. Never share your secret key. All usages explained below are
**specifically** for a Node.js server.

### Account
Account API encompasses our authentication, login, and user creation APIs.

#### account.create(user [, callback])
This method creates a new user. It has more strict validation than the standard
`user` API and will send welcome emails if configured.

##### Arguments
- [`user`][user], required.
    - `firstName` string, required.
    - `lastName` string, required.
    - `email` string, required.
    - `password` string, required.
    - `passwordConfirm` string, required.
- `callback`, optional.

##### Returns
- [`user`][user]

#### account.get([callback])
This method returns account information for currently logged in user.

##### Arguments
- `callback`, optional

##### Returns
- [`user`][user]

#### account.login(user [, callback])
This method logs in a user and sets a user token on the client for making calls on their behalf.

##### Arguments
- [`user`][user], required.
    - `email` string, required.
    - `password` string, required.
- `callback`, optional.

##### Returns
- [`user`][user]

#### account.logout([callback])
This method destroys the current user session.

##### Arguments
- `callback`, optional.

##### Returns
- null

#### account.exists(identifier [, callback])
This method checks to see if a exists, as per the identifier.

##### Arguments
- `identifier` string, required.  Can be a user's email, username, or unique id.
- `callback`, optional

##### Returns
- boolean

#### account.reset(opts [, callback])
This method starts the account reset process (such as if a user has forgotten their password)

##### Arguments
- `opts`, required, contains the following key:
    - `email`, string, required
- `callback`, optional

##### Returns
- null

#### account.resetConfirm(tokenId [, callback])
This method completes the account reset process by confirming it with the ID garnished from the user's email.

##### Arguments
- `tokenId` string, required
- `callback`, optional

##### Returns
- null

#### account.update(user [, callback])
This method updates a user with new information.  All fields in the [`user`][user] object are optional,
but the ones given will overwrite whatever was there before.

##### Arguments
- [`user`][user], required.
    - `firstName` string, optional
    - `lastName` string, optional
    - `phone` string, optional
    - `billingAddress` string, optional
    - `shippingAddress` string, optional
    - `email` string, optional
- `callback`, optional.

##### Returns
- [`user`][user]

### Checkout
Checkout encompasses the actual purchase of things from your website, and has support for both
one and two step payment styles.

#### checkout.charge(opts [, callback])
This is the one-step payment process, which will attempt to both authorize and capture the payment
at the same time.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
    - [`payment`][payment], payment information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.

#### checkout.authorize(opts [, callback])
This is the first half of the two-step payment process, and will authorize the payment for later capture.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
    - [`payment`][payment], payment information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.

#### checkout.capture(opts [, callback])
This is the first half of the two-step payment process, and will capture a payment that has been authorized prior.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
    - [`payment`][payment], payment information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.


#### checkout.paypal(opts [, callback])
This initiates a PayPal payment.

##### Arguments
- `opts` required, containing the following keys:
    - [`user`][user], user making order.
    - [`order`][order], order information.
- `callback`, optional.

##### Returns
- [`order`][order], order information.  `PayKey` is added to the order to allow for appropriate redirection to PayPal's site.

### Collection
This entity represents a bundle of products that are available on your shop.

#### collection.get(id [, callback])
This gets the information of a collection with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`collection`][collection], collection information.
#### collection.list([callback])
This lists all the collections available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`collection[]`][collection], an array of available collections.

#### collection.create(collection [, callback])
This creates a new collection.

##### Arguments
- [`collection`][collection], collection information, required
- `callback`, optional

##### Returns
- [`collection`][collection], the newly created collection, with unique identifier information added.

#### collection.update(collection [, callback])
This updates a collection with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`collection`][collection], collection information, requires:
    -`id` string, the unique identifier for the collection to be changed
- `callback`, optional

##### Returns
- [`collection`][collection], the newly modified collection, with unique identifier information added.

#### collection.delete(id [, callback])
This deletes a collection from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Order
This represents a confirmed request for products.

#### order.get(id [, callback])
This gets the information of a order with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`order`][order], order information.

#### order.list([callback])
This lists all the orders available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`order[]`][order], an array of available orders.

#### order.create(order [, callback])
This creates a new order.

##### Arguments
- [`order`][order], order information, required
- `callback`, optional

##### Returns
- [`order`][order], the newly created order, with unique identifier information added.

#### order.update(order [, callback])
This updates a order with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`order`][order], order information, requires:
    -`id` string, the unique identifier for the order to be changed
- `callback`, optional

##### Returns
- [`order`][order], the newly modified order, with unique identifier information added.

#### order.delete(id [, callback])
This deletes a order from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Payment
This represents a transaction to give you money.

#### payment.get(id [, callback])
This gets the information of a payment with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`payment`][payment], payment information.

#### payment.list([callback])
This lists all the payments available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`payment[]`][payment], an array of available payments.

#### payment.create(payment [, callback])
This creates a new payment.

##### Arguments
- [`payment`][payment], payment information, required
- `callback`, optional

##### Returns
- [`payment`][payment], the newly created payment, with unique identifier information added.

#### payment.update(payment [, callback])
This updates a payment with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`payment`][payment], payment information, requires:
    -`id` string, the unique identifier for the payment to be changed
- `callback`, optional

##### Returns
- [`payment`][payment], the newly modified payment, with unique identifier information added.

#### payment.delete(id [, callback])
This deletes a payment from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Product
This represents a thing that is available on your shop.

#### product.get(id [, callback])
This gets the information of a product with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`product`][product], product information.

#### product.list([callback])
This lists all the products available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`product[]`][product], an array of available products.

#### product.create(product [, callback])
This creates a new product.

##### Arguments
- [`product`][product], product information, required
- `callback`, optional

##### Returns
- [`product`][product], the newly created product, with unique identifier information added.

#### product.update(product [, callback])
This updates a product with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`product`][product], product information, requires:
    -`id` string, the unique identifier for the product to be changed
- `callback`, optional

##### Returns
- [`product`][product], the newly modified product, with unique identifier information added.

#### product.delete(id [, callback])
This deletes a product from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Referral
This represents an identifying instance of an order that happened due to the intervention of a user on your site.

#### referral.get(id [, callback])
This gets the information of a referral with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`referral`][referral], referral information.

#### referral.list([callback])
This lists all the referrals available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`referral[]`][referral], an array of available referrals.

#### referral.create(referral [, callback])
This creates a new referral.

##### Arguments
- [`referral`][referral], referral information, required
- `callback`, optional

##### Returns
- [`referral`][referral], the newly created referral, with unique identifier information added.

#### referral.update(referral [, callback])
This updates a referral with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`referral`][referral], referral information, requires:
    -`id` string, the unique identifier for the referral to be changed
- `callback`, optional

##### Returns
- [`referral`][referral], the newly modified referral, with unique identifier information added.

#### referral.delete(id [, callback])
This deletes a referral from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Referrer
This represents a user that has induced an order to happen.

#### referral.get(id [, callback])
This gets the information of a referral with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`referral`][referral], referral information.

#### referral.list([callback])
This lists all the referrals available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`referral[]`][referral], an array of available referrals.

#### referral.create(referral [, callback])
This creates a new referral.

##### Arguments
- [`referral`][referral], referral information, required
- `callback`, optional

##### Returns
- [`referral`][referral], the newly created referral, with unique identifier information added.

#### referral.update(referral [, callback])
This updates a referral with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`referral`][referral], referral information, requires:
    -`id` string, the unique identifier for the referral to be changed
- `callback`, optional

##### Returns
- [`referral`][referral], the newly modified referral, with unique identifier information added.

#### referral.delete(id [, callback])
This deletes a referral from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Subscriber
This represents a user that is subscribed to a mailing list.

#### subscriber.get(id [, callback])
This gets the information of a subscriber with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`subscriber`][subscriber], subscriber information.

#### subscriber.list([callback])
This lists all the subscribers available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`subscriber[]`][subscriber], an array of available subscribers.

#### subscriber.create(subscriber [, callback])
This creates a new subscriber.

##### Arguments
- [`subscriber`][subscriber], subscriber information, required
- `callback`, optional

##### Returns
- [`subscriber`][subscriber], the newly created subscriber, with unique identifier information added.

#### subscriber.update(subscriber [, callback])
This updates a subscriber with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`subscriber`][subscriber], subscriber information, requires:
    -`id` string, the unique identifier for the subscriber to be changed
- `callback`, optional

##### Returns
- [`subscriber`][subscriber], the newly modified subscriber, with unique identifier information added.

#### subscriber.delete(id [, callback])
This deletes a subscriber from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Transaction
This represents an internal action to settle up a user's account - think of it as store credit to Payment's real money.

#### transaction.get(id [, callback])
This gets the information of a transaction with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`transaction`][transaction], transaction information.

#### transaction.list([callback])
This lists all the transactions available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`transaction[]`][transaction], an array of available transactions.

#### transaction.create(transaction [, callback])
This creates a new transaction.

##### Arguments
- [`transaction`][transaction], transaction information, required
- `callback`, optional

##### Returns
- [`transaction`][transaction], the newly created transaction, with unique identifier information added.

#### transaction.update(transaction [, callback])
This updates a transaction with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`transaction`][transaction], transaction information, requires:
    -`id` string, the unique identifier for the transaction to be changed
- `callback`, optional

##### Returns
- [`transaction`][transaction], the newly modified transaction, with unique identifier information added.

#### transaction.delete(id [, callback])
This deletes a transaction from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### User
This is a customer on your site.

#### user.get(id [, callback])
This gets the information of a user with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`user`][user], user information.

#### user.list([callback])
This lists all the users available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`user[]`][user], an array of available users.

#### user.create(user [, callback])
This creates a new user.

##### Arguments
- [`user`][user], user information, required
- `callback`, optional

##### Returns
- [`user`][user], the newly created user, with unique identifier information added.

#### user.update(user [, callback])
This updates a user with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`user`][user], user information, requires:
    -`id` string, the unique identifier for the user to be changed
- `callback`, optional

##### Returns
- [`user`][user], the newly modified user, with unique identifier information added.

#### user.delete(id [, callback])
This deletes a user from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

### Variant
This is an entity that represents a variation of a product that is available on your site.

#### variant.get(id [, callback])
This gets the information of a variant with the supplied ID.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- [`variant`][variant], variant information.

#### variant.list([callback])
This lists all the variants available on your store.

##### Arguments
- `callback`, optional

##### Returns
- [`variant[]`][variant], an array of available variants.

#### variant.create(variant [, callback])
This creates a new variant.

##### Arguments
- [`variant`][variant], variant information, required
- `callback`, optional

##### Returns
- [`variant`][variant], the newly created variant, with unique identifier information added.

#### variant.update(variant [, callback])
This updates a variant with new information.  All fields aside from the unique identifier are optional, and if present, will overwrite
what is on the server.

##### Arguments
- [`variant`][variant], variant information, requires:
    -`id` string, the unique identifier for the variant to be changed
- `callback`, optional

##### Returns
- [`variant`][variant], the newly modified variant, with unique identifier information added.

#### variant.delete(id [, callback])
This deletes a variant from your account.

##### Arguments
- `id` string, required
- `callback`, optional

##### Returns
- boolean

## License
[BSD][license-url]

[hanzo]:           https://hanzo.ai
[hanzo.js]:        https://cdn.rawgit.com/hanzoai/hanzo.js/v2.2.8/hanzo.min.js

[collection]:  https://docs.hanzo.ai
[coupon]:      https://docs.hanzo.ai
[order]:       https://docs.hanzo.ai
[payment]:     https://docs.hanzo.ai
[product]:     https://docs.hanzo.ai
[referral]:    https://docs.hanzo.ai
[referrer]:    https://docs.hanzo.ai
[subscriber]:  https://docs.hanzo.ai
[transaction]: https://docs.hanzo.ai
[user]:        https://docs.hanzo.ai
[variant]:     https://docs.hanzo.ai

[build-img]:        https://img.shields.io/travis/hanzoai/hanzo.js.svg
[build-url]:        https://travis-ci.org/hanzoai/hanzo.js
[chat-img]:         https://badges.gitter.im/join-chat.svg
[chat-url]:         https://gitter.im/hanzoai/chat
[coverage-img]:     https://coveralls.io/repos/hanzoai/hanzo.js/badge.svg?branch=master&service=github
[coverage-url]:     https://coveralls.io/github/hanzoai/hanzo.js?branch=master
[dependencies-img]: https://david-dm.org/hanzoai/hanzo.js.svg
[dependencies-url]: https://david-dm.org/hanzoai/hanzo.js
[downloads-img]:    https://img.shields.io/npm/dm/hanzo.js.svg
[downloads-url]:    http://badge.fury.io/js/hanzo.js
[license-img]:      https://img.shields.io/npm/l/hanzo.js.svg
[license-url]:      https://github.com/hanzoai/hanzo.js/blob/master/LICENSE
[npm-img]:          https://img.shields.io/npm/v/hanzo.js.svg
[npm-url]:          https://www.npmjs.com/package/hanzo.js
