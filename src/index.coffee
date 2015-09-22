Client = new (require './crowdstart')

if typeof window isnt 'undefined'
  if window.Crowdstart?
    window.Crowdstart.Client  = Crowdstart
  else
    window.Crowdstart = Client: Crowdstart
else
  module.exports = Client
