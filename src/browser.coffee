import Api        from './api'
import Client     from './client/browser'
import blueprints from './blueprints/browser'

Api.BLUEPRINTS = blueprints
Api.CLIENT     = Client

Hanzo = (opts = {}) ->
  opts.client     ?= new Client opts
  opts.blueprints ?= blueprints
  new Api opts

Hanzo.Api        = Api
Hanzo.Client     = Client

export default Hanzo
