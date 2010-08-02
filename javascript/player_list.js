var PlayerList = function(me, room, options) {
  this.me = me;
  this.room = room;

  this.players = {};
  this.add_player(me, '#000000');

  room.add_subscriber(me);

  if (!options) options = {};
  this.onComplete = options.onComplete || function() {};

  var self = this;
  var client = new Faye.Client('/faye');
  client.subscribe('/move', function(message) {
    self.walk_player(message);
  });
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
  if (this.me.id == id) {
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
