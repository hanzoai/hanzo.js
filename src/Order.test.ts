import Order, { OrderSide, OrderType } from './Order';

describe('Order', () => {
  test('constructor', () => {
    let b = new Order('id', OrderSide.BID, OrderType.MARKET)

    expect(b.externalId).toBe('id')
    expect(b.side).toBe(OrderSide.BID)
    expect(b.type).toBe(OrderType.MARKET)
    expect(b.quantity.equals(0)).toBe(true)
    expect(b.price.equals(0)).toBe(true)
    expect(b.fillQuantity.equals(0)).toBe(true)
  })

  test('full constructor', () => {
    let b = new Order('id', OrderSide.BID, OrderType.MARKET, 1, 0)

    expect(b.externalId).toBe('id')
    expect(b.side).toBe(OrderSide.BID)
    expect(b.type).toBe(OrderType.MARKET)
    expect(b.quantity.equals(1)).toBe(true)
    expect(b.price.equals(0)).toBe(true)
    expect(b.fillQuantity.equals(0)).toBe(true)
  })
})
