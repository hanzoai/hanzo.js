import Decimal from 'decimal.js'

import Candle, { CandleAVL, CandleInterval } from './Candle';
import Trade from './Trade'
import time from './utils/time'

describe.only('Candle', () => {
  test('constructor', () => {
    let c = new Candle(CandleInterval.ONE_MINUTE, new Trade(
      new Decimal(100),
      new Decimal(200),
      [],
      [],
      [],
      time('2014-06-01T12:00:00Z').valueOf(),
    ))

    expect(c.openTime).toBe(time('2014-06-01T12:00:00Z').startOf('minute').valueOf())
    expect(c.closeTime).toBe(time('2014-06-01T12:00:00Z').endOf('minute').valueOf())
    expect(c.interval).toBe(CandleInterval.ONE_MINUTE)
    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(200))).toBe(true)
    expect(c.low.equals(new Decimal(200))).toBe(true)
    expect(c.close.equals(new Decimal(200))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200))).toBe(true)
    expect(c.trades).toBe(1)
  })

  test('addTradeData open, high, low, close, volume, quoteAssetVolume, and trades', () => {
    // Open
    let c = new Candle(CandleInterval.ONE_MINUTE, new Trade(
      new Decimal(100),
      new Decimal(200),
    ))

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(200))).toBe(true)
    expect(c.low.equals(new Decimal(200))).toBe(true)
    expect(c.close.equals(new Decimal(200))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200))).toBe(true)
    expect(c.trades).toBe(1)

    // New Low
    c.addTradeData(new Decimal(150), new Decimal(160))

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(200))).toBe(true)
    expect(c.low.equals(new Decimal(160))).toBe(true)
    expect(c.close.equals(new Decimal(160))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100 + 150))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200 + 150 * 160))).toBe(true)
    expect(c.trades).toBe(2)

    // New High
    c.addTradeData(new Decimal(50), new Decimal(1000))

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(1000))).toBe(true)
    expect(c.low.equals(new Decimal(160))).toBe(true)
    expect(c.close.equals(new Decimal(1000))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100 + 150 + 50))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200 + 150 * 160 + 50 * 1000))).toBe(true)
    expect(c.trades).toBe(3)

    let ex = c.export()
    expect(ex).toEqual([
      c.openTime,
      c.closeTime,
      '200',
      '1000',
      '160',
      '1000',
      '94000',
      '300',
      3,
    ])
  })

  test('addTrade open, high, low, close, volume, quoteAssetVolume, and trades', () => {
    // Open
    let c = new Candle(CandleInterval.ONE_MINUTE, new Trade(
      new Decimal(100),
      new Decimal(200),
    ))

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(200))).toBe(true)
    expect(c.low.equals(new Decimal(200))).toBe(true)
    expect(c.close.equals(new Decimal(200))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200))).toBe(true)
    expect(c.trades).toBe(1)

    // New Low
    c.addTrade(new Trade(new Decimal(150), new Decimal(160)))

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(200))).toBe(true)
    expect(c.low.equals(new Decimal(160))).toBe(true)
    expect(c.close.equals(new Decimal(160))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100 + 150))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200 + 150 * 160))).toBe(true)
    expect(c.trades).toBe(2)

    // New High
    c.addTrade(new Trade(new Decimal(50), new Decimal(1000)))

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(1000))).toBe(true)
    expect(c.low.equals(new Decimal(160))).toBe(true)
    expect(c.close.equals(new Decimal(1000))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100 + 150 + 50))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200 + 150 * 160 + 50 * 1000))).toBe(true)
    expect(c.trades).toBe(3)

    // Failure
    expect(() => c.addTrade(new Trade(new Decimal(20), new Decimal(20), [], [], [], 0))).toThrow()

    expect(c.open.equals(new Decimal(200))).toBe(true)
    expect(c.high.equals(new Decimal(1000))).toBe(true)
    expect(c.low.equals(new Decimal(160))).toBe(true)
    expect(c.close.equals(new Decimal(1000))).toBe(true)
    expect(c.quoteAssetVolume.equals(new Decimal(100 + 150 + 50))).toBe(true)
    expect(c.volume.equals(new Decimal(100 * 200 + 150 * 160 + 50 * 1000))).toBe(true)
    expect(c.trades).toBe(3)

    let ex = c.export()
    expect(ex).toEqual([
      c.openTime,
      c.closeTime,
      '200',
      '1000',
      '160',
      '1000',
      '94000',
      '300',
      3,
    ])
  })

  test('hasTime', () => {
    let t = time()

    let c = new Candle(CandleInterval.ONE_MINUTE, new Trade(
      new Decimal(100),
      new Decimal(200),
      [],
      [],
      [],
      t.valueOf(),
    ))

    // inclusive
    expect(c.hasTime(t)).toBe(true)
    expect(c.hasTime(time(t).add(1, 'second'))).toBe(true)
    expect(c.hasTime(time(t).endOf('minute'))).toBe(true)

    // out of range
    expect(c.hasTime(0)).toBe(false)
    expect(c.hasTime(time(t).endOf('minute').add(1, 'second'))).toBe(false)
  })
})

describe.only('CandleAVL', () => {
  test('constructor', () => {
    let c = new CandleAVL(CandleInterval.ONE_MINUTE)

    expect(c.interval).toBe(CandleInterval.ONE_MINUTE)
  })

  test('tradesToCandles stacks', () => {
    let c = new CandleAVL(CandleInterval.ONE_MINUTE)

    c.tradesToCandles([
      new Trade(
        new Decimal(1),
        new Decimal(3),
      ),
      new Trade(
        new Decimal(1),
        new Decimal(2),
      ),
      new Trade(
        new Decimal(1),
        new Decimal(2.5),
      ),
    ])

    let v = c.values()
    expect(v.length).toBe(1)

    let cdl = v[0]
    expect(cdl.open.equals(3)).toBe(true)
    expect(cdl.high.equals(3)).toBe(true)
    expect(cdl.low.equals(2)).toBe(true)
    expect(cdl.close.equals(2.5)).toBe(true)
    expect(cdl.volume.equals(7.5)).toBe(true)
    expect(cdl.quoteAssetVolume.equals(3)).toBe(true)
  })

  test('tradesToCandles sorts', () => {
    let c = new CandleAVL(CandleInterval.ONE_MINUTE)

    let t = time()

    let t1 = new Trade(
      new Decimal(1),
      new Decimal(3),
      [], [], [], t.valueOf()
    )

    let t2 = new Trade(
      new Decimal(1),
      new Decimal(2),
      [], [], [], time(t).add(2, 'minutes').valueOf()
    )

    let t3 = new Trade(
      new Decimal(1),
      new Decimal(2.5),
      [], [], [], time(t).add(-1, 'minutes').valueOf()
    )

    c.tradesToCandles([ t1, t2, t3 ])

    let v = c.values()
    expect(v.length).toBe(3)
    expect(v[0].open.equals(2.5)).toBe(true)
    expect(v[1].open.equals(3)).toBe(true)
    expect(v[2].open.equals(2)).toBe(true)
  })

  test('tradesToCandles timeSlices', () => {
    let c = new CandleAVL(CandleInterval.ONE_MINUTE)

    let t = time()

    let t1 = new Trade(
      new Decimal(1),
      new Decimal(3),
      [], [], [], t.valueOf()
    )

    let t2 = new Trade(
      new Decimal(1),
      new Decimal(2),
      [], [], [], time(t).add(2, 'minutes').valueOf()
    )

    let t3 = new Trade(
      new Decimal(1),
      new Decimal(2.5),
      [], [], [], time(t).add(-1, 'minutes').valueOf()
    )

    c.tradesToCandles([ t1, t2, t3 ])

    let v = c.timeSlice(time(t).add(-1, 'minutes').valueOf(), time(t).add(1, 'minutes').valueOf())

    expect(v.length).toBe(2)
    expect(v[0].open.equals(2.5)).toBe(true)
    expect(v[1].open.equals(3)).toBe(true)
  })
})

