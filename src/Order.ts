import Decimal from 'decimal.js'
import uuid from 'uuid'
import time from './utils/time'

/**
 * side of the order
 */
export enum OrderSide {
  /**
   * ask order
   */
  ASK = 'ask',
  /**
   * bid order
   */
  BID = 'bid',
}

/**
 * type of the order
 */
export enum OrderType {
  /**
   * limit order
   */
  LIMIT = 'limit',
  /**
   * market order
   */
  MARKET = 'market',
}

/**
 * status of the order
 */
export enum OrderStatus {
  /**
   * unfilled order (default state)
   */
  UNFILLED = 'unfilled',
  /**
   * unfilled left over order from a partial fill
   */
  REMAINDER = 'remainder',
  /**
   * partially filled order
   */
  PARTIALLY_FILLED = 'partially-filled',
  /**
   * fully filled order
   */
  FILLED = 'filled',
  /**
   * partially filled but cancelled order
   */
  PARTIALLY_FILLED_CANCELLED = 'partially-filled-cancelled',
  /**
   * cancelled order
   */
  CANCELLED = 'cancelled',
  /**
   * partially filled but remainder rejected
   */
  PARTIALLY_FILLED_REMAINDER_REJECTED = 'partially-filled-remainder-rejected',
  /**
   * remainder rejected
   */
  REMAINDER_REJECTED = 'remainder-rejected',
}

let orderCount = 0

/**
 * represents an order that's put in a book
 */
export default class Order {
  /**
   * unique order id
   */
  id: string = uuid.v4()

  /**
   * unique sequencing number, used for tie breakers
   */
  seqId: number = orderCount++

  /**
   * id from an external system
   */
  externalId: string

  /**
   * side of the order
   */
  side: OrderSide

  /**
   * type of the order
   */
  type: OrderType

  /**
   * status of the order
   */
  status: OrderStatus = OrderStatus.UNFILLED

  /**
   * bid/ask price
   */
  price: Decimal

  /**
   * order size
   */
  quantity: Decimal

  /**
   * amount filled
   */
  fillQuantity: Decimal

  /**
   * unix creation time
   */
  createdAt: number

  /**
   * order constructor
   * @param externalId id of order from another system
   * @param type type of this order
   * @param price price of this order
   * @param quantity quantity involved in this order
   */
  constructor(externalId: string, side: OrderSide, type: OrderType, quantity: number | string | Decimal = 0, price: number | string | Decimal = 0, fillQuantity: number | string | Decimal = 0, createdAt: number = time().valueOf()) {
    this.externalId = externalId
    this.side = side
    this.type = type
    this.quantity = new Decimal(quantity)
    this.price = new Decimal(price)
    this.fillQuantity = new Decimal(fillQuantity)
    this.createdAt = createdAt
  }

  /**
   * @return return a clone of this order
   */
  clone(): Order {
    return new Order(this.externalId, this.side, this.type, this.quantity, this.price)
  }
}
