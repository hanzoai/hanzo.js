Crowdstart = new (require './crowdstart')

if typeof window isnt 'undefined'
  window.Crowdstart = Crowdstart
else
  module.exports = Crowdstart
