import Api        from './api'
import Client     from './client/node'
import blueprints from './blueprints/node'

Client.KEY      = process.env.HANZO_KEY
Client.ENDPOINT = process.env.HANZO_ENDPOINT
Client.DEBUG    = process.env.HANZO_DEBUG


Hanzo =
  Api:        Api
  Client:     Client
  blueprints: blueprints

export default Hanzo
