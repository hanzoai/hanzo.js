{statusCreated, statusNoContent, statusOk} = require '../utils'

endpoint = (x) ->
  "/site/#{x.siteId}/deploy"

byId = (x) ->
  "#{endpoint x}/#{x.id ? x.deployId}"

upload = (x) ->
  "#{byId x}/#{x.path}"

module.exports = (blueprints) ->
  blueprints.deploy =
    create:
      url:     endpoint
      method:  'POST'
      expects: statusCreated
    update:
      url:     byId
      method:  'PATCH'
      expects: statusOk
    delete:
      url:     byId
      method:  'DELETE'
      expects: statusNoContent
    restore:
      url:     byId
      method:  'POST'
      expects: statusOk
    upload:
      url:     upload
      method:  'PUT'
      expects: statusOk
      headers:
        'Content-Type': 'application/octet-stream'
      streams: (x) -> fs.createReadStream x.absolutePath
      followRedirects: true
