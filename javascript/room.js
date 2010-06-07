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
  var x = evt.pageX - $(this.container).offset().left;

  if (x < 0)
    x = 0;
  else if (x > this.paper.width)
    x = this.paper.width;

  var y = evt.pageY - $(this.container).offset().top;
  if (y < 0)
    y = 0;
  else if (y > this.paper.width)
    y = this.paper.width;

  return {
    type: evt.type,
    x: x,
    y: y
  };
};

Room.prototype.draw_player = function(player, color) {
  var c = this.paper.circle(player.x, player.y, 10);
  c.attr({fill: color, "fill-opacity": 0.5, stroke: '#000', "stroke-width": 2, "stroke-opacity": 1.0});
  return c;
};

Room.prototype.draw = function() {
  var self = this;

  this.paper = Raphael(this.container, 500, 500);
  this.paper.clear();
  this.paper.
    rect(0, 0, 500, 500, 4).
    attr({fill: "#fff", stroke: "none"});

  $('<div id="chat">' +
    '<form id="chat-form" action="#">' +
    '<label for="change-message">Chat:</label>' +
    '<input type="text" name="message" id="chat-message" />' +
    '<input type="submit" name="commit" value="Go" />' +
    '</form>' +
    '</div>').insertAfter($(self.paper.canvas).parent());

  $('#chat-form').submit(function(e) {
    self.subscribers.forEach(
      function(subscriber) {
        var event = {
          type: "message",
          value:  $('#chat-message').val()
        };
        subscriber.notify(event);
        $('#chat-message').val('');
      }
    );
    return false;
  });
};
