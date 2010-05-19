var Room = function(container) {
  this.container = container;

  this.subscribers = [];
  this.init_events();

  this.draw();
};

Room.prototype.add_subscriber = function(obj) {
  this.subscribers.push(obj);
};

Room.prototype.init_events = function() {
  var self = this;
  $(this.container).click(function(evt) {
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
  return c;
};

Room.prototype.draw = function() {
  var self = this;

  this.paper = Raphael(this.container, 500, 500);
  this.paper.clear();
  this.paper.
    rect(0, 0, 500, 500, 4).
    attr({fill: "#fff", stroke: "none"});

  // this.draw_player(this.player_list.me, '#000000');

  // this.player_list.others().forEach(function(player) {
  //   self.draw_player(player, '#aaaaaa');
  // });
};

