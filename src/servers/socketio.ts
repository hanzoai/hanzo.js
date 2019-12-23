import SocketIO from 'socket.io'

import time from '../utils/time'
import Book from '../Book'
import Order from '../Order'
import Trade from '../Trade'
import { CandleAVL, CandleInterval } from '../Candle'

const bookRoomName = (x: string) => x + '.book'
const tradeRoomName = (x: string) => x + '.trades'
const nameFromRoomName = (x: string) => x.split('.')[0]

export type onTradeFn = (name: string, ts: Trade[]) => void

export default function createSocketIO(
  books: Map<string, Book>,
  candleTrees: Map<string, Map<CandleInterval, CandleAVL>>,
  app: any,
  createBook: any,
  onTrade: (fn: onTradeFn) => void,
) {
  const http: any = require('http').createServer(app)
  const io: SocketIO.Server = SocketIO(http, {
    pingTimeout: 200000,
    pingInterval: 300000,
    origins: '*:*',
  })

  const intervalCodes = new Map<string, CandleInterval>([
    ['1m', CandleInterval.ONE_MINUTE],
    ['1h', CandleInterval.ONE_HOUR],
    ['1d', CandleInterval.ONE_DAY],
    ['1w', CandleInterval.ONE_WEEK],
  ])

  const getEmitData = (book: Book) => {
    if (!book) return {}

    const meanPrice = book.meanPrice
    const lastPrice = book.lastPrice
    const spread = book.displaySpread
    const orderBook = {
      asks: book.orderBook.asks.slice(0, 100).reverse(),
      bids: book.orderBook.bids.slice(-100).reverse(),
    }

    return { meanPrice, spread, orderBook, lastPrice, time: time().valueOf() }
  }

  // Setup broadcast interval for bid data
  let broadcastInterval = setInterval(() => {
    // Iterate through each book and broadcast to each room
    // console.log('Sending out the order books!')
    console.log('Found socket rooms', io.sockets.adapter.rooms, new Date())
    const rooms = Object.keys(io.sockets.adapter.rooms)

    if (rooms) {
      const broadcasted: any = {}

      rooms.forEach(r => {
        const name = nameFromRoomName(r)
        const book = books.get(name)

        if (book && !broadcasted[name]) {
          // console.log(`Broadcasting to ${r}`)
          io.to(bookRoomName(name)).emit('book.data', getEmitData(book))
        }
      })
    }
  }, 500)

  // Setup broadcast for trade data trigger
  onTrade((name: string, ts: Trade[] = []) => {
    io.to(tradeRoomName(name)).emit('trade.data', ts.map(({ id, fillPrice, fillQuantity, executedAt, matchedOrders }) => ({ id, fillPrice, fillQuantity, executedAt, executingOrder: matchedOrders[0] })))
  })

  io.on('connection', (socket: SocketIO.Socket) => {
    const ip = socket.handshake.headers['x-forwarded-for'] ?? socket.conn.remoteAddress;
    console.log('user connected', ip)

    // On connection we should check to see if the user has previous historical data
    // If they have client side data already we need to figure out any gaps they're missing and fill them
    // If they don't have client data we need to send them the historical payload

    socket.on('book.subscribe', (room: any) => {
      const { name } = room
      const roomName = bookRoomName(name)

      try {
        let book = books.get(name)
        if (!book) {
          // Make the book
          book = createBook(name)
          if (!book) {
            throw new Error('Double check for book, these are dumb')
          }
        }

        socket.join(roomName)
        const emitData = getEmitData(book)
        socket.emit('book.subscribe.success', {
          success: true,
          ...emitData,
        })
      } catch (e) {
        socket.emit('book.subscribe.error', {
          error: e.message,
        })
      }
    })

    socket.on('book.unsubscribe', (room: any) => {
      const { name } = room
      const roomName = bookRoomName(name)

      try {
        socket.leave(roomName)

        socket.emit('book.unsubscribe.success', { success: true })
      } catch (e) {
        socket.emit('book.unsubscribe.error', {
          error: e.message,
        })
      }
    })

    socket.on('trade.subscribe', (room: any) => {
      const { name } = room
      const roomName = tradeRoomName(name)

      try {
        let book = books.get(name)
        if (!book) {
          // Make the trade
          book = createBook(name)
          if (!book) {
            throw new Error('Double check for trade, these are dumb')
          }
        }

        socket.join(roomName)
        socket.emit('trade.subscribe.success', {
          success: true,
        })
      } catch (e) {
        socket.emit('trade.subscribe.error', {
          error: e.message,
        })
      }
    })

    socket.on('trade.unsubscribe', (room: any) => {
      const { name } = room
      const roomName = tradeRoomName(name)

      try {
        socket.leave(roomName)

        socket.emit('trade.unsubscribe.success', { success: true })
      } catch (e) {
        socket.emit('trade.unsubscribe.error', {
          error: e.message,
        })
      }
    })

    socket.on('order.create', (order: any) => {
      const { externalId, side, type, quantity, price, name } = order

      try {
        const trade = books.get(name)
        if (!trade) {
          throw new Error(`trade ${trade} not found`)
        }
        const o = new Order(externalId, side, type, quantity, price)
        trade.addOrder(o)

        io.to(name).emit('order.create.success', order)
      } catch (e) {
        socket.emit('order.create.error', {
          error: e.message,
        })
      }
    })

    // We should change this to be an interval that broadcasts every 10 seconds or so
    // That way the client knows to append the data
    socket.on('candles.get', (opts: any = {}) => {
      let {
        endTime,
        startTime,
        interval,
        limit,
        name,
        type
      } = opts

      console.log('type', type)

      try {
        const cts = candleTrees.get(name)

        if (!cts) {
          throw new Error(`No candles found for ${name}`)
        }

        endTime = endTime || time().valueOf()
        // interval = interval || CandleInterval.Hour
        limit = limit || 1000

        // TODO Add limit and time

        const ct = cts.get(
          intervalCodes.get(interval) as CandleInterval,
        )
        if (!ct) {
          throw new Error(
            `Candle interval ${interval} for ${name} not found`,
          )
        }
        const candles = ct.timeSlice(startTime, endTime, limit).map((x) => x.export())
        socket.emit('candles.get.success', { candles, type })
      } catch (e) {
        socket.emit('candles.get.error', {
          error: e.message,
        })
      }
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })

  return http
}
