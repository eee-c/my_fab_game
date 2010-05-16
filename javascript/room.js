var Room = function(container, player_list) {
  this.container = container;

  this.subscribers = [];
  this.init_events();

  this.player_list = player_list;

  this.me = player_list.me;
  this.add_subscriber(this.me);

  this.draw();
};

Room.prototype.get_me = function() { return this.me; };

Room.prototype.add_subscriber = function(obj) {
  this.subscribers.push(obj);
};

Room.prototype.init_events = function() {
  var self = this;
  $(this.container).click(function(evt) {
                        console.debug("here");
    var decorated_event = self.decorate_event(evt);
    self.subscribers.forEach(
      function(subscriber) { subscriber.notify(decorated_event); }
    );
  });
};

Room.prototype.decorate_event = function(evt) {
  return {
    type: evt.type,
    x: evt.pageX - $(this.container).offset().left,
    y: evt.pageY - $(this.container).offset().top
  };
};

Room.prototype.draw_player = function(player, color) {
  var c = this.paper.circle(player.y, player.x, 3);
  c.attr({fill: color, opacity: 0.5});
};

Room.prototype.draw = function() {
  var self = this;

  this.paper = Raphael(this.container, 500, 500);
  this.paper.clear();
  this.paper.
    rect(0, 0, 500, 500, 4).
    attr({fill: "#fff", stroke: "none"});

  this.draw_player(this.me, '#000000');

  this.player_list.others().forEach(function(player) {
    self.draw_player(player, '#aaaaaa');
  });
};

