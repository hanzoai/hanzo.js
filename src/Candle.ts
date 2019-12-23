import Decimal from 'decimal.js'
import AVLTree from 'avl'

import Trade   from './Trade'
import time, { Time } from './utils/time'
import memoize from 'fast-memoize'

/**
 * interval for each candle
 */
export enum CandleInterval {
  ONE_MINUTE = '1 minute',
  ONE_HOUR   = '1 hour',
  ONE_DAY    = '1 day',
  ONE_WEEK   = '1 week',
}

/**
 * a map collection for candles with the same intervals
 */
export class CandleAVL extends AVLTree<number, Candle> {
  interval: CandleInterval
  private timeFrame: string

  /**
   * @param interval candle interval for children
   */
  constructor(interval: CandleInterval) {
    super()

    this.interval = interval
    this.timeFrame = interval.split(' ')[1]

    const oldTimeSlice = this.timeSlice
    this.timeSlice = memoize((...args: [number, number, (number | undefined)]) => oldTimeSlice.apply(this, args))
  }

  /**
   * process trades into candles
   * @param trades a list of trades to turn into candles
   * @return return this to make it chainable
   */
  tradesToCandles(trades: Trade[]): CandleAVL {
    for (let trade of trades) {
      let startTime = time(trade.executedAt).startOf(this.timeFrame as any)

      let s = startTime.valueOf()

      let refCandle = this.find(s)
      if (refCandle && refCandle.data) {
        refCandle.data.addTradeData(trade.fillQuantity, trade.fillPrice)
      } else {
        this.insert(s, new Candle(this.interval, trade))
      }
    }

    return this
  }

  /**
   * returns the candles withing a certain time range
   * @param startTime lower time bound
   * @param endTime higher time bound
   * @return an array of candles
   */
  timeSlice(startTime: number, endTime: number, limit: number = 1000): Candle[] {
    let factor = 1000

    switch(this.interval) {
      case CandleInterval.ONE_WEEK: {
        factor *= 7
      }
      case CandleInterval.ONE_DAY: {
        factor *= 24
      }
      case CandleInterval.ONE_HOUR: {
        factor *= 60
      }
      default: {
        factor *= 60
      }
    }

    limit = Math.max(Math.min(limit, 1000), 1)
    startTime = startTime ?? (endTime - (limit - 1) * factor)

    let candles: Candle[] = []

    this.range(time(startTime).startOf(this.timeFrame as any).valueOf(), time(endTime).endOf(this.timeFrame as any).valueOf(), (node) => {
      candles.push(node.data as Candle)
      if (candles.length >= limit) {
        return true
      }
    })

    return candles
  }
}

/**
 * candle data
 */
export default class Candle {
  /**
   * candle open time
   */
  openTime:  number

  /**
   * candle close time
   */
  closeTime: number

  /**
   * cached opentime in moment format
   */
  private _openTime:  Time

  /**
   * cached closetime in moment format
   */
  private _closeTime: Time

  /**
   * candle interval
   */
  interval: CandleInterval

  /**
   * open number
   */
  open:   Decimal

  /**
   * high number
   */
  high:   Decimal

  /**
   * low number
   */
  low:    Decimal

  /**
   * close number
   */
  close:  Decimal

  /**
   * volume in terms of price * quantity
   */
  volume: Decimal

  /**
   * quantity
   */
  quoteAssetVolume: Decimal

  /**
   * number of trades
   */
  trades:   number

  /**
   * @param interval candle interval
   * @param trade trade to bootstrap candle with
   */
  constructor(interval: CandleInterval, t: Trade) {
    let timeFrame = interval.split(' ')[1]

    this._openTime  = time(t.executedAt).startOf(timeFrame as any)
    this._closeTime = time(t.executedAt).endOf(timeFrame as any)

    this.openTime  = this._openTime.valueOf()
    this.closeTime = this._closeTime.valueOf()

    this.interval  = interval

    this.open      = t.fillPrice
    this.high      = this.open
    this.low       = this.open
    this.close     = this.open

    this.quoteAssetVolume = t.fillQuantity
    this.volume = this.open.mul(this.quoteAssetVolume)

    this.trades = 1
  }

  /**
   * add just the import trade params to the candle (skips the date check)
   * @return return this to make it chainable
   */
  addTradeData(quantity: Decimal, price: Decimal) {
    this.close = price

    if (price.greaterThan(this.high)) {
      this.high = price
    }

    if (price.lessThan(this.low)) {
      this.low = price
    }

    this.quoteAssetVolume = this.quoteAssetVolume.add(quantity)
    this.volume = this.volume.add(price.mul(quantity))
    this.trades++

    return this
  }

  /**
   * add trade to the candle if it is in the correct timeframe
   * @return return this to make it chainable or throw error
   */
  addTrade(t: Trade) {
    if (this.hasTime(t.executedAt)) {
      this.addTradeData(t.fillQuantity, t.fillPrice)
      return this
    }

    throw new Error(`trade execution time outside of candle range ${this._openTime.format()}-${this._closeTime.format()}`)
  }

  /**
   * Does the candle interval include this time?
   * @return true if the time is included in the candle, false otherwise
   */
  hasTime(t: Time | string | number) {
    let t2 = time(t)

    return t2.isSameOrAfter(this._openTime) && t2.isSameOrBefore(this._closeTime)
  }

  /**
   * returns exported format based on binance api
   *
   * example:
   * [
   *   1499040000000,      // Open time
   *   1499644799999,      // Close time
   *   "0.01634790",       // Open
   *   "0.80000000",       // High
   *   "0.01575800",       // Low
   *   "0.01577100",       // Close
   *   "148976.11427815",  // Volume
   *   "2434.19055334",    // Quote asset volume
   *   308,                // Number of trades
   * ]
   */
  export(): any[] {
    return [
      this.openTime,
      this.closeTime,
      this.open.toString(),
      this.high.toString(),
      this.low.toString(),
      this.close.toString(),
      this.volume.toString(),
      this.quoteAssetVolume.toString(),
      this.trades,
    ]
  }
}
