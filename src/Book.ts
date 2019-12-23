import uuid from 'uuid'
import Decimal from 'decimal.js'
import requestAnimationFrame from 'raf'
import FibonacciHeap from 'mnemonist/fibonacci-heap'
import AVLTree from 'avl'

import Order, { OrderStatus, OrderType, OrderSide } from './Order'
import Trade from './Trade'

/**
 * interface for the orderbook
 */
export interface OrderBook {
  asks: [string, string][],
  bids: [string, string][],
}

/**
 * sorts array by natural order of string
 */
export const naturalOrderCollator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})

/**
 * max-heap comparator function
 * @param first order
 * @param second order
 * @return negative if b.price < a.price, ties broken by creation time
 */
export const bidComparator = function(a: Order, b: Order) {
  let ret = b.price.sub(a.price).toNumber()
  if (ret === 0) {
    ret = a.seqId - b.seqId
  }
  return ret
}

/**
 * min-heap comparator function
 * @param first order
 * @param second order
 * @return negative if b.price > a.price, ties broken by creation time
 */
export const askComparator = function(a: Order, b: Order) {
  let ret = a.price.sub(b.price).toNumber()
  if (ret === 0) {
    ret = a.seqId - b.seqId
  }
  return ret
}

/**
 * a avl tree of order price strings to decimals
 */
export type OrderBookTree = AVLTree<string, Decimal>

/**
 * a map of order price strings to decimals
 */
export type OrderBookMap = Map<string, Decimal>

/**
 * a priorty queue of orders
 */
export type OrderHeap = FibonacciHeap<Order>

/**
 * a map of order price strings to decimals
 */
export type OrderMap  = Map<string, Order>

/**
 * Object representing continuing execution
 */
export interface ExecutionContext {
  stop: () => void
}

/**
 * order book for keeping track of and settling orders
 */
class Book {
  /**
   * unique book id
   */
  id: string = uuid.v4()

  /**
   * string identifier for book (generally something simple like the trading
   * pair)
   */
  name: string

  /**
   * ask heap
   */
  asks: OrderHeap  = new FibonacciHeap<Order>(askComparator)

  /**
   * bid heap
   */
  bids: OrderHeap = new FibonacciHeap<Order>(bidComparator)

  /**
   * this keeps track of the current orderbook as a map of prices to volumes
   */
  private _orderBook: OrderBookTree = new AVLTree<string, Decimal>(naturalOrderCollator.compare)

  /**
   * this keeps track of the rendered orderbook
   */
  private _renderedOrderBook: OrderBook = {
    bids: [],
    asks: [],
  }

  /**
   * cached spread price, can only safely be taken after a settle
   */
  private _displaySpread: Decimal = new Decimal(0)

  /**
   * cached mean price, can only safely be taken after a settle
   */
  private _meanPrice: Decimal = new Decimal(0)

  /**
   * cached last executed price, can only safely be taken after a settle
   */
  private _lastPrice: Decimal = new Decimal(0)

  /**
   * this is a list of pending orders that is merged into the existing orderbook on settle
   */
  pendingOrderBook: OrderBookMap = new Map<string, Decimal>()

  /**
   * this keeps track of all the orders so updating status and cancellation is
   * easier
   */
  activeOrders: OrderMap = new Map<string, Order>()

  /**
   * order constructor
   * @param name name of this book
   */
  constructor(name: string) {
    this.name = name
  }

  /**
   * get the number of asks, note cancelled but unsettled orders are only
   * periodically removed
   * @return returns number of asks
   */
  get askSize() {
    return this.asks.size
  }

  /**
   * get the number of bids, note cancelled but unsettled orders are only
   * periodically removed
   * @return returns number of bids
   */
  get bidSize() {
    return this.bids.size
  }

  /**
   * @return returns the nearest ask order
   */
  nearestAsk(): Order | undefined {
    let order

    // skip cancelled orders
    do {
      order = this.asks.peek()
      if (order && !this.activeOrders.has(order.id)) {
        this.asks.pop()
      } else {
        break
      }
    } while(true)

    return order
  }

  /**
   * @return returns the nearest bid order
   */
  nearestBid(): Order | undefined {
    let order

    // skip cancelled orders
    do {
      order = this.bids.peek()
      if (order && !this.activeOrders.has(order.id)) {
        this.bids.pop()
      } else {
        break
      }
    } while(true)

    return order
  }

  /**
   * @return returns the current orderbook (readonly)
   */
  get orderBook(): OrderBook {
    return this._renderedOrderBook
  }

  /**
   * modify the pending order book, skip 0s
   * @param price price to add the quantity to
   * @param quantity quantity to add to pending order book
   */
  addToPendingOrderBook(price: Decimal, quantity: Decimal) {
    if (!quantity.equals(0)) {
      // add the order quantity to the pendingOrderBook
      let priceStr = price.toString()
      let q = this.pendingOrderBook.get(priceStr) ?? new Decimal(0)
      this.pendingOrderBook.set(priceStr, q.add(quantity))
    }
  }

  /**
   * Insert an order into the order book
   * @param order order to add or throw an error
   */
  addOrder(order: Order): boolean {
    // Market orders are the only orders that can be missing price
    if (order.price.lessThan(0)) {
      throw new Error('invalid negative price')
    }

    if (!order.price.isFinite()) {
      throw new Error('invalid price is not finite')
    }

    if (order.quantity.lessThanOrEqualTo(0)) {
      throw new Error('invalid non-positive quantity')
    }

    if (!order.quantity.isFinite()) {
      throw new Error('invalid quantity is not finite')
    }

    if (order.side === OrderSide.BID) {
      // error if market into empty opposing order queue
      if(this.askSize === 0 && order.type === OrderType.MARKET) {
        throw new Error('no asks for market order')
      }

      // insert as a bid
      this.bids.push(order)
    } else if (order.side === OrderSide.ASK) {
      // error if market into empty opposing order queue
      if(this.bidSize === 0 && order.type === OrderType.MARKET) {
        throw new Error('no bids for market order')
      }

      // insert as a bid
      this.asks.push(order)

    } else {
      throw new Error(`unknown order side: ${ order.side }`)
    }

    // Market orders are the only orders that can be missing price
    if (order.type !== OrderType.MARKET) {
      if (order.price.equals(0)) {
        throw new Error('only market orders can be missing price')
      }
      this.addToPendingOrderBook(order.price, order.quantity)
    }

    // add the order into the activeOrders list
    this.activeOrders.set(order.id, order)

    // add the order quantity to the pendingOrderBook


    return true
  }

  /**
   * cancel an order if it exists
   * @param order order to cancel
   */
  cancelOrder(order: Order): boolean {
    if (this.activeOrders.has(order.id)) {
      this.activeOrders.delete(order.id)

      // remove the order quantity from the pendingOrderBook
      this.addToPendingOrderBook(order.price, order.quantity.neg())

      return true
    }

    return false
  }

  /**
   * @return return the spread between bid and asks or Infinity if less than 2
   * limit orders
   */
  get spread(): Decimal {
    return this.nearestAsk()?.price.sub(this.nearestBid()?.price ?? 0) ?? new Decimal(0)
  }

  /**
   * @return return the spread for display
   */
  get displaySpread(): Decimal {
    return this._displaySpread
  }

  /**
   * @return return the average of the lowest ask and the highest bid
   */
  get meanPrice(): Decimal {
    return this._meanPrice
  }

  /**
   * @return return the lasted price traded
   */
  get lastPrice(): Decimal {
    return this._lastPrice
  }

  /**
   * settle the order book by executing overlapping trades
   */
  settle(): Trade[] {
    let trades = []

    do  {
      // break if one of the books is empty
      if (this.bids.size === 0 || this.asks.size === 0 || this.activeOrders.size <= 1) {
        // console.log('no orders on atleast one side')
        break
      }

      let primaryOrder: Order
      let secondaryOrder: Order

      // One market , one limit on top.
      if (this.nearestAsk()?.type === OrderType.MARKET) {
        primaryOrder = this.asks.pop() as Order
        secondaryOrder = this.bids.pop() as Order
      } else if (this.nearestBid()?.type === OrderType.MARKET) {
        primaryOrder = this.bids.pop() as Order
        secondaryOrder = this.asks.pop() as Order
      //if Both Limit and price match exists
      } else if (this.spread.lessThanOrEqualTo(0)) {
        primaryOrder = this.asks.pop() as Order
        secondaryOrder = this.bids.pop() as Order
      } else {
        // console.log('no overlapping orders')
        break
      }

      // Two market orders should never collide since market orders are not allowed to exist on illiquid books
      let newOrders        = []
      let marketOrder      = primaryOrder.quantity.greaterThan(secondaryOrder.quantity) ? primaryOrder : secondaryOrder
      let fillQuantity     = Decimal.min(primaryOrder.quantity, secondaryOrder.quantity)
      let leftOverQuantity = Decimal.max(primaryOrder.quantity, secondaryOrder.quantity).sub(fillQuantity)

      let rejectedOrders = []
      // partially filled order with left over
      if (leftOverQuantity.greaterThan(0)) {
        let newOrder    = marketOrder.clone()

        newOrder.quantity = leftOverQuantity
        newOrder.status   = OrderStatus.REMAINDER
        newOrders.push(newOrder)

        // Figure out which order got partially filled
        if (marketOrder == primaryOrder)  {
          primaryOrder.status   = OrderStatus.PARTIALLY_FILLED
          secondaryOrder.status = OrderStatus.FILLED
        } else {
          primaryOrder.status   = OrderStatus.FILLED
          secondaryOrder.status = OrderStatus.PARTIALLY_FILLED
        }

        try {
          this.addOrder(newOrder)
        } catch (e) {
          if (marketOrder == primaryOrder)  {
            primaryOrder.status   = OrderStatus.PARTIALLY_FILLED_REMAINDER_REJECTED
          } else {
            secondaryOrder.status = OrderStatus.PARTIALLY_FILLED_REMAINDER_REJECTED
          }

          newOrder.status = OrderStatus.REMAINDER_REJECTED

          // console.log(`could not add order ${ marketOrder.id }`)
          rejectedOrders.push(newOrder)
        }
      // Exact match
      } else {
        primaryOrder.status = OrderStatus.FILLED
        secondaryOrder.status = OrderStatus.FILLED
      }

      // Set quantity filled
      primaryOrder.fillQuantity   = fillQuantity
      secondaryOrder.fillQuantity = fillQuantity

      let pIsLimit = primaryOrder.type == OrderType.LIMIT
      let sIsLimit = secondaryOrder.type == OrderType.LIMIT

      if (pIsLimit) {
        this.addToPendingOrderBook(primaryOrder.price, primaryOrder.quantity.neg())
      }

      if (sIsLimit ) {
        this.addToPendingOrderBook(secondaryOrder.price, secondaryOrder.quantity.neg())
      }

      let fillPrice = secondaryOrder.price

      let matchedOrders = []

      // handle aggressive limit fill price, take the older order's price
      if (primaryOrder.seqId < secondaryOrder.seqId) {
        fillPrice = primaryOrder.price
        matchedOrders = [secondaryOrder, primaryOrder]
      } else {
        matchedOrders = [primaryOrder, secondaryOrder]
      }

      trades.push(
        new Trade(
          fillQuantity,
          fillPrice,
          newOrders,
          matchedOrders,
          rejectedOrders
        )
      )

      // cancel matched orders
      this.activeOrders.delete(primaryOrder.id)
      this.activeOrders.delete(secondaryOrder.id)

      // remove quantities from pendingOrderBook
      let quantity = this.pendingOrderBook.get(primaryOrder.id)

      // add order to bookID
    } while(true)

    // Merge pending into order book
    this.pendingOrderBook.forEach((v: Decimal, k: string) => {
      const quantity = this._orderBook.find(k)
      if (quantity) {
        let val = v.add(quantity.data as Decimal)
        if (val.equals(0)) {
          this._orderBook.remove(k)
        } else {
          quantity.data = val
        }
      } else if (!v.equals(0)) {
        this._orderBook.insert(k, v)
      }
    })

    this.pendingOrderBook.clear()

    // Generate cached rendered order book
    let askPrice = this.nearestAsk()?.price
    let bidPrice = this.nearestBid()?.price

    this._renderedOrderBook.asks.length = 0
    this._renderedOrderBook.bids.length = 0

    let lastTrade = trades[trades.length - 1]
    if (lastTrade) {
      this._lastPrice = lastTrade.fillPrice
    }

    if (bidPrice && askPrice) {
      this._meanPrice = askPrice.add(bidPrice).div(2)

      let isBids = true

      // split into bids and asks
      let vs = this._orderBook.values()
      let ks = this._orderBook.keys()
      for (let k in ks) {
        let p = ks[k]
        if (isBids && this._meanPrice.lessThan(p)) {
          isBids = false
        }

        if (isBids) {
          this._renderedOrderBook.bids.push([p, vs[k].toString()])
        } else {
          this._renderedOrderBook.asks.push([p, vs[k].toString()])
        }
      }
    } else if (askPrice) {
      this._meanPrice = askPrice

      let vs = this._orderBook.values()
      let ks = this._orderBook.keys()
      for (let k in ks) {
        let p = ks[k]
        this._renderedOrderBook.asks.push([p, vs[k].toString()])
      }
    } else if (bidPrice) {
      this._meanPrice = bidPrice

      let vs = this._orderBook.values()
      let ks = this._orderBook.keys()
      for (let k in ks) {
        let p = ks[k]
        this._renderedOrderBook.bids.push([p, vs[k].toString()])
      }
    } else {
      this._meanPrice = new Decimal(0)
    }

    // cache a safe to display spread
    this._displaySpread = this.spread

    // TODO: handle cancellations

    return trades
  }

  /**
   * start executing settle repeatedly, only run once
   * @param settleFn function that executes with the return value of settle
   * @return return an ExecutionContext with a stop function
   */
  start(settleFn: (b: Book, t: Trade[]) => void = () => {}): ExecutionContext {
    let stop = false
    const fn = () => {
      if (!stop) {
        settleFn(this, this.settle())
        requestAnimationFrame(fn)
      }
    }

    fn()

    return {
      stop: () => {
        stop = true
      }
    }
  }
}

export default Book
