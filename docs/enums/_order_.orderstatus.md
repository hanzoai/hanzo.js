[@hanzo/matching-engine](../README.md) › [Globals](../globals.md) › ["Order"](../modules/_order_.md) › [OrderStatus](_order_.orderstatus.md)

# Enumeration: OrderStatus

status of the order

## Index

### Enumeration members

* [CANCELLED](_order_.orderstatus.md#cancelled)
* [FILLED](_order_.orderstatus.md#filled)
* [PARTIALLY_FILLED](_order_.orderstatus.md#partially_filled)
* [PARTIALLY_FILLED_CANCELLED](_order_.orderstatus.md#partially_filled_cancelled)
* [PARTIALLY_FILLED_REMAINDER_REJECTED](_order_.orderstatus.md#partially_filled_remainder_rejected)
* [REMAINDER](_order_.orderstatus.md#remainder)
* [REMAINDER_REJECTED](_order_.orderstatus.md#remainder_rejected)
* [UNFILLED](_order_.orderstatus.md#unfilled)

## Enumeration members

###  CANCELLED

• **CANCELLED**: = "cancelled"

*Defined in [Order.ts:60](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L60)*

cancelled order

___

###  FILLED

• **FILLED**: = "filled"

*Defined in [Order.ts:52](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L52)*

fully filled order

___

###  PARTIALLY_FILLED

• **PARTIALLY_FILLED**: = "partially-filled"

*Defined in [Order.ts:48](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L48)*

partially filled order

___

###  PARTIALLY_FILLED_CANCELLED

• **PARTIALLY_FILLED_CANCELLED**: = "partially-filled-cancelled"

*Defined in [Order.ts:56](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L56)*

partially filled but cancelled order

___

###  PARTIALLY_FILLED_REMAINDER_REJECTED

• **PARTIALLY_FILLED_REMAINDER_REJECTED**: = "partially-filled-remainder-rejected"

*Defined in [Order.ts:64](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L64)*

partially filled but remainder rejected

___

###  REMAINDER

• **REMAINDER**: = "remainder"

*Defined in [Order.ts:44](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L44)*

unfilled left over order from a partial fill

___

###  REMAINDER_REJECTED

• **REMAINDER_REJECTED**: = "remainder-rejected"

*Defined in [Order.ts:68](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L68)*

remainder rejected

___

###  UNFILLED

• **UNFILLED**: = "unfilled"

*Defined in [Order.ts:40](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Order.ts#L40)*

unfilled order (default state)
