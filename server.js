'use strict'
if (process.argv.length != 4) {
  console.log(`usage: node server.js token appId`)
  process.exit()
}

var http = require('http')
var fs = require('fs')
var url = require('url')
var fetch = require('node-fetch')
var serverAddress = 'https://v1.daikeapi.com'
var token = process.argv[2]
var appId = process.argv[3]

http.createServer(function(request, response) {
  let path = url.parse(request.url).pathname
  console.log(request.method, path)
  if (path != '/') {
    response.writeHead(404, {'Content-Type': 'text/html'})
    response.end()
    return
  }
  if (request.method == 'GET') {
    fs.readFile('index.html', function(err, data) {
      if (err) {
        console.log(err)
        response.writeHead(404, {'Content-Type': 'text/html'})
      } else {
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.write(data.toString())
      }
      response.end()
    })
  } else if (request.method == 'POST') {
    let body = ''
    request.on('data', function(data) {
      body += data
    })
    request.on('end', function() {
      let r = JSON.parse(body)
      let ticketId, endpoint, events = []
      if (r.description) {
        // create ticket, more arguments please refer to https://developer.getdaike.com/public-api/#api_2
        fetch(`${serverAddress}/api/tickets`, {
          method: 'POST',
          body: `description=${encodeURIComponent(r.description)}&tags[]=tag1&name=test_user`,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${token}`,
            'X-Daike-App-Id': appId
          }
        })
        .then(function(res) {
          return res.json()
        })
        .then(function(json) {
          ticketId = json.id
          events = json.events
          // get chat endpoint, reference: https://developer.getdaike.com/public-api/#api_6
          fetch(`${serverAddress}/api/chats`, {
            method: 'POST',
            body: JSON.stringify({ticket_id: ticketId}),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
              'X-Daike-App-Id': appId
            }
          })
          .then(function(res) {
            return res.json()
          })
          .then(function(json) {
            endpoint = json.endpoint
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({
              ticket_id: ticketId,
              endpoint: endpoint,
              events: events
            }))
            response.end()
          })
        })
      } else if (r.ticket_id) {
        ticketId = r.ticket_id
        // get ticket history, reference: https://developer.getdaike.com/public-api/#api_4
        fetch(`${serverAddress}/api/tickets/${ticketId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
            'X-Daike-App-Id': appId
          }
        }).
        then(function(res) {
          return res.json()
        })
        .then(function(json) {
          ticketId = json.id
          events = json.events
          // get chat endpoint, reference: https://developer.getdaike.com/public-api/#api_6
          fetch(`${serverAddress}/api/chats`, {
            method: 'POST',
            body: JSON.stringify({ticket_id: ticketId}),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
              'X-Daike-App-Id': appId
            }
          })
          .then(function(res) {
            return res.json()
          })
          .then(function(json) {
            endpoint = json.endpoint
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({
              ticket_id: ticketId,
              endpoint: endpoint,
              events: events
            }))
            response.end()
          })
        })
      } else {
        response.writeHead(400, {'Content-Type': 'text/html'})
        response.end()
      }
    })
  } else {
    response.writeHead(405, {'Content-Type': 'text/html'})
    response.end()
  }
}).listen(8000, '127.0.0.1')

console.log('server started at 127.0.0.1:8000\n')