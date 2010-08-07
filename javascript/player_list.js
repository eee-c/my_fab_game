var PlayerList = function(me, room, options) {
  this.me = me;
  this.room = room;

  this.players = {};
  this.add_player(me, '#000000');

  room.add_subscriber(me);

  if (!options) options = {};
  this.onComplete = options.onComplete || function() {};

  this.faye = new Faye.Client('/faye');

  this.init_population();
  this.init_subscriptions();

  this.faye.publish('/players/create', me.attrs());
};

PlayerList.prototype.init_subscriptions = function() {
  var self = this;

  this.faye.subscribe('/move', function(message) {
    self.walk_player(message);
  });

  this.faye.subscribe('/bounce', function(message) {
    self.bounce_player(message);
  });

  this.faye.subscribe('/chat', function(message) {
    self.player_say(message);
  });

  this.faye.subsribe('/quit', function(message) {
    self.player_quit(message);
  });

  this.faye.subscribe('/players/create', function(message) {
    if (message.id != self.me.id) self.new_player(message);
  });
};

PlayerList.prototype.init_population = function() {
  var self = this;
  var subscription = this.faye.subscribe('/players/all', function(players) {
    for (var i=0; i<players.length; i++) {
      self.new_player(players[i]);
    }
  });

  this.faye.publish('/players/query', 'all');

  setTimeout(function() {subscription.cancel();}, 2000);
};

PlayerList.prototype.walk_player = function(attrs) {
  var player = this.get_player(attrs.id);
  if (player) {
    player.walk_to(attrs.x, attrs.y);
  }
};

PlayerList.prototype.bounce_player = function(attrs) {
  var player = this.get_player(attrs.id);
  if (player) {
    player.stop();
    player.bounce_to(attrs.x, attrs.y);
  }
};

PlayerList.prototype.player_say = function(attrs) {
  this.get_player(attrs.id).say(attrs.say);
};

PlayerList.prototype.new_player = function(obj) {
  if (!this.players[obj.id]) {
    this.add_player(new Player(obj.id, obj));
  }
};

PlayerList.prototype.add_player = function(player, color) {
  this.players[player.id] = player;
  if (!color) color = '#999999';
  var el = this.room.draw_player(player, color);
  player.attach_avatar(el);
};

PlayerList.prototype.remove_player = function(id) {
  if (id == this.me.id) {
    // I am leaving and so is everyone else (as far as I'm concerned)
    for (var pid in this.players) {
      this.players[pid].quit();
    }
    this.onComplete();
  }
  else {
    this.get_player(id).quit();
    delete this.players[id];
  }
};

PlayerList.prototype.get_player = function(id) {
  return this.players[id];
};
