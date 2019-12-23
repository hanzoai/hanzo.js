import Trade from './Trade'
import Order, { OrderSide, OrderType } from './Order'
import Decimal from 'decimal.js'

describe('Trade', () => {
  test('Trade constructor', () => {
    let o1 = new Order('new', OrderSide.BID, OrderType.MARKET)
    let o2 = new Order('m1', OrderSide.BID, OrderType.MARKET)
    let o3 = new Order('m2', OrderSide.BID, OrderType.MARKET)
    let o4 = new Order('failed', OrderSide.BID, OrderType.MARKET)

    let t = new Trade(new Decimal(0), new Decimal(0), [o1], [o2, o3], [o4], 0)

    expect(t.fillPrice.equals(0)).toBe(true)
    expect(t.fillQuantity.equals(0)).toBe(true)
    expect(t.newOrders).toEqual([o1])
    expect(t.matchedOrders).toEqual([o2, o3])
    expect(t.rejectedOrders).toEqual([o4])
    expect(t.executedAt).toBe(0)
  })
})
