var PlayerList = function(me) {
  this.me = me;
  this.other_players = {};
};

PlayerList.prototype.add_player = function(obj) {
  if (!this.other_players[obj.id] && obj.id != this.me.id) {
    if (console) {console.debug("adding:" + obj.id);}
    this.other_players[obj.id] = new Player(obj.id, obj);
  }
};

PlayerList.prototype.get_player = function(id) {
  if (console) {console.debug("getting:" + id);}
  return this.other_players[id];
};

PlayerList.prototype.me = function() {
  return this.me;
};

PlayerList.prototype.others = function() {
  var ret = [];
  for (var id in this.other_players) {
    ret.push(this.other_players[id]);
  }
  return ret;
};
