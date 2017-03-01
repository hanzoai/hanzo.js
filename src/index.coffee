import Api        from './api'
import Client     from './client/node'
import blueprints from './blueprints/node'
import * as utils from './utils'

Api.BLUEPRINTS = blueprints
Api.CLIENT     = Client

Hanzo = (opts = {}) ->
  opts.client     ?= new Client opts
  opts.blueprints ?= blueprints
  new Api opts

Hanzo.Api        = Api
Hanzo.Client     = Client
Hanzo.blueprints = blueprints
Hanzo.utils      = utils

export default Hanzo
