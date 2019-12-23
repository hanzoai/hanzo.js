[@hanzo/matching-engine](../README.md) › [Globals](../globals.md) › ["Book"](_book_.md)

# External module: "Book"

## Index

### Classes

* [Book](../classes/_book_.book.md)

### Interfaces

* [ExecutionContext](../interfaces/_book_.executioncontext.md)
* [OrderBook](../interfaces/_book_.orderbook.md)

### Type aliases

* [OrderBookMap](_book_.md#orderbookmap)
* [OrderBookTree](_book_.md#orderbooktree)
* [OrderHeap](_book_.md#orderheap)
* [OrderMap](_book_.md#ordermap)

### Variables

* [naturalOrderCollator](_book_.md#const-naturalordercollator)

### Functions

* [askComparator](_book_.md#const-askcomparator)
* [bidComparator](_book_.md#const-bidcomparator)

## Type aliases

###  OrderBookMap

Ƭ **OrderBookMap**: *Map‹string, Decimal›*

*Defined in [Book.ts:59](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L59)*

a map of order price strings to decimals

___

###  OrderBookTree

Ƭ **OrderBookTree**: *AVLTree‹string, Decimal›*

*Defined in [Book.ts:54](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L54)*

a avl tree of order price strings to decimals

___

###  OrderHeap

Ƭ **OrderHeap**: *FibonacciHeap‹[Order](../classes/_order_.order.md)›*

*Defined in [Book.ts:64](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L64)*

a priorty queue of orders

___

###  OrderMap

Ƭ **OrderMap**: *Map‹string, [Order](../classes/_order_.order.md)›*

*Defined in [Book.ts:69](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L69)*

a map of order price strings to decimals

## Variables

### `Const` naturalOrderCollator

• **naturalOrderCollator**: *Collator* =  new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})

*Defined in [Book.ts:21](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L21)*

sorts array by natural order of string

## Functions

### `Const` askComparator

▸ **askComparator**(`a`: [Order](../classes/_order_.order.md), `b`: [Order](../classes/_order_.order.md)): *number*

*Defined in [Book.ts:43](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L43)*

min-heap comparator function

**Parameters:**

Name | Type |
------ | ------ |
`a` | [Order](../classes/_order_.order.md) |
`b` | [Order](../classes/_order_.order.md) |

**Returns:** *number*

negative if b.price > a.price, ties broken by creation time

___

### `Const` bidComparator

▸ **bidComparator**(`a`: [Order](../classes/_order_.order.md), `b`: [Order](../classes/_order_.order.md)): *number*

*Defined in [Book.ts:29](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L29)*

max-heap comparator function

**Parameters:**

Name | Type |
------ | ------ |
`a` | [Order](../classes/_order_.order.md) |
`b` | [Order](../classes/_order_.order.md) |

**Returns:** *number*

negative if b.price < a.price, ties broken by creation time
