import {statusCreated, statusNoContent, statusOk} from '../utils'

endpoint = (x) ->
  "/site/#{x.siteId}/deploy"

byId = (x) ->
  "#{endpoint x}/#{x.id ? x.deployId}"

upload = (x) ->
  "#{byId x}/files/#{x.path}"

deploy =
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
    file: (x) -> x.absolutePath
    followRedirects: true

export default deploy
