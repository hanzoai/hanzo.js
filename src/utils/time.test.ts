import time from './time'
import moment from 'moment'

describe('time', () => {
  test('test', () => {
    let date = moment('2014-06-01T12:00:00Z');

    expect(time(date).format()).toBe('2014-06-01T08:00:00-04:00')
  })
})
