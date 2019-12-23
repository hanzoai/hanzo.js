[@hanzo/matching-engine](../README.md) › [Globals](../globals.md) › ["Order"](../modules/_order_.md) › [Order](_order_.order.md)

# Class: Order

represents an order that's put in a book

## Hierarchy

* **Order**

## Index

### Constructors

* [constructor](_order_.order.md#constructor)

### Properties

* [createdAt](_order_.order.md#createdat)
* [externalId](_order_.order.md#externalid)
* [fillQuantity](_order_.order.md#fillquantity)
* [id](_order_.order.md#id)
* [price](_order_.order.md#price)
* [quantity](_order_.order.md#quantity)
* [side](_order_.order.md#side)
* [status](_order_.order.md#status)
* [type](_order_.order.md#type)

### Methods

* [clone](_order_.order.md#clone)

## Constructors

###  constructor

\+ **new Order**(`externalId`: string, `side`: [OrderSide](../enums/_order_.orderside.md), `type`: [OrderType](../enums/_order_.ordertype.md), `quantity`: number | string | Decimal, `price`: number | string | Decimal, `fillQuantity`: number | string | Decimal, `createdAt`: number): *[Order](_order_.order.md)*

*Defined in [Order.ts:118](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L118)*

order constructor

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`externalId` | string | - | id of order from another system |
`side` | [OrderSide](../enums/_order_.orderside.md) | - | - |
`type` | [OrderType](../enums/_order_.ordertype.md) | - | type of this order |
`quantity` | number &#124; string &#124; Decimal | 0 | quantity involved in this order  |
`price` | number &#124; string &#124; Decimal | 0 | price of this order |
`fillQuantity` | number &#124; string &#124; Decimal | 0 | - |
`createdAt` | number |  time().valueOf() | - |

**Returns:** *[Order](_order_.order.md)*

## Properties

###  createdAt

• **createdAt**: *number*

*Defined in [Order.ts:118](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L118)*

unix creation time

___

###  externalId

• **externalId**: *string*

*Defined in [Order.ts:83](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L83)*

id from an external system

___

###  fillQuantity

• **fillQuantity**: *Decimal*

*Defined in [Order.ts:113](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L113)*

amount filled

___

###  id

• **id**: *string* =  uuid.v4()

*Defined in [Order.ts:78](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L78)*

unique order id

___

###  price

• **price**: *Decimal*

*Defined in [Order.ts:103](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L103)*

bid/ask price

___

###  quantity

• **quantity**: *Decimal*

*Defined in [Order.ts:108](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L108)*

order size

___

###  side

• **side**: *[OrderSide](../enums/_order_.orderside.md)*

*Defined in [Order.ts:88](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L88)*

side of the order

___

###  status

• **status**: *[OrderStatus](../enums/_order_.orderstatus.md)* =  OrderStatus.UNFILLED

*Defined in [Order.ts:98](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L98)*

status of the order

___

###  type

• **type**: *[OrderType](../enums/_order_.ordertype.md)*

*Defined in [Order.ts:93](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L93)*

type of the order

## Methods

###  clone

▸ **clone**(): *[Order](_order_.order.md)*

*Defined in [Order.ts:140](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L140)*

**Returns:** *[Order](_order_.order.md)*

return a clone of this order
