#!/usr/bin/env node

// Don't crash on errors
process.on('uncaughtException', function (err) {
  console.log('Caught uncaughtException: ' + err.stack);
});

var express = require('express'),
    http = require('http'),
    faye = require('faye'),
    inspect = require( "sys" ).inspect,
    puts = require( "sys" ).puts;

// Player local store
var players = (require("./lib/players")).init();

var Logger = require("./lib/logger");

Logger.info("Starting up...");

// Create the Express server
var app = express.createServer();

// Serve statics from ./public
app.use(express.static(__dirname + '/public'));


// Render the game board with Jade
app.set('view engine', 'jade');

app.get('/board', function(req, res) {
  res.render('board');
});


// Faye nodejs adapter
var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

attach_faye(app);

// Listen on port 4011 (0xFAB)
app.listen(4011);


// Additional functions

function attach_faye(server) {
  var faye_server = new faye.NodeAdapter({
    mount:    '/faye',
    timeout:  45
  });

  faye_server.attach(server);

  // attach the extension ensuring player messages come from the same
  // client that originally added player to the room
  var auth = require("./lib/faye_server_auth").init(function () {
    players.get.apply(players, arguments);
  });
  faye_server.addExtension(auth);
}
