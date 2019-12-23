import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import Book  from '../Book'
import Order from '../Order'
import Candle, { CandleAVL, CandleInterval } from '../Candle'

export default function createHttp (books: Map<string, Book>, candleTrees: Map<string, Map<CandleInterval, CandleAVL>>) {
  const app = express()

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())
  app.use(cors())

  const newOrder = (req: Request, res: Response) => {
    const { name } = req.params
    const book = books.get(name)

    if (!book) {
      res.status(404)
      return
    }

    const {
      externalId,
      side,
      type,
      quantity,
      price,
    } = req.body

    try {
      const o = new Order(externalId, side, type, quantity, price)
      book.addOrder(o)
      res.status(201).json(o)
    } catch (e) {
      res.status(500).json({
        error: e.message,
      })
    }
  }

  app.post('/:name/orders', newOrder)
  app.put('/:name/orders',  newOrder)

  const getOrderBook = (req: Request, res: Response) => {
    const { name } = req.params
    const book = books.get(name)

    if (!book) {
      res.status(404)
      return
    }

    let bids = []
    let asks = []
    let isBid = true

    res.status(200).json(book.orderBook)
  }

  app.get('/:name/orders', getOrderBook)

  const intervalCodes = new Map<string, CandleInterval>([
    ['1m', CandleInterval.ONE_MINUTE],
    ['1h', CandleInterval.ONE_HOUR],
    ['1d', CandleInterval.ONE_DAY],
  ])

  const getCandles = (req: Request, res: Response) => {
    const { name } = req.params
    const cts = candleTrees.get(name)

    if (!cts) {
      res.status(404)
      return
    }

    const { interval } = req.params

    const ct = cts.get(intervalCodes.get(interval) as CandleInterval)

    if (ct) {
      res.status(200).json(ct.values().map((x: Candle) => x.export()))
    } else {
      res.status(404)
    }
  }

  app.get('/:name/candles/:interval', getCandles)

  return app
}

