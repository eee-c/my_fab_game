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


// Server-side extension to lock player messages to client that added
// the player in the first place,
// http://japhr.blogspot.com/2010/08/per-message-authorization-in-faye.html
var serverAuth = {
  incoming: function(message, callback) {
    // Let non-meta messages through
    if (message.channel.indexOf('/meta/') === 0)
      return callback(message);

    puts(message.channel);

    // Get subscribed channel and auth token
    var subscription = message.subscription,
        msgToken     = message.ext && message.ext.authToken;

    // If the message has a player ID
    if (message.data.id) {
      puts("  checking for player: " + message.data.id);
      puts(players);
      puts(players.get(message.data.id));

      // If the player is already in the room
      if (players.get(message.data.id)) {
        puts("[token check] " + players.get(message.data.id).token + " " + msgToken);

        // If the tokens do not match, stop the message
        if (players.get(message.data.id).token != msgToken) {
          puts("rejecting mis-matched token message");
          message.error = 'Invalid player auth token';
        }
      }
      else {
        puts(message.data.id + " adding message token: " + msgToken);
        message.data.authToken = msgToken;
      }
    }

    // Call the server back now we're done
    return callback(message);
  }
};

// Faye nodejs adapter
var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

// Add the server-side faye extension
bayeux.addExtension(serverAuth);

// Add the faye nodejs faye adapter to the nodejs server
bayeux.attach(app);

// Listen on port 4011 (0xFAB)
app.listen(4011);

function info(write) {
  return write(function(write, head) {
    var q = require('querystring').parse(head.url.query);
    if (q.message)
      write('<div id="info">' + q.message + '</div>');
    return write;
  });
}


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
