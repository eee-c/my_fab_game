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

Room.prototype.player_frames = function() {
var standing = [
  { label: "left_leg",
    style: "fill:none;stroke:#000000;stroke-width:0.99999779px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;display:inline",
    d: "M 9.7001312,18.93142 C 9.4644309,22.702657 9.2287306,26.473893 8.9930303,30.24513" },

  { label: "left_foot",
    style: "fill:#000000;fill-opacity:1;stroke:#5c5c5c;stroke-width:2.99999332;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;display:inline",
    d: "m 10.05369,30.24513 c 0.327615,1.840766 -2.8988646,2.36968 -3.1748797,0.518115 -0.7374997,-1.876039 2.6083446,-3.28822 3.0814774,-1.11966 l 0.06622,0.298496 0.02718,0.303049 z" },

  { label: "right_leg",
    style: "fill:none;stroke:#000000;stroke-width:0.99999779px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;display:inline",
    d: "m 13.942752,18.93142 c 0.353552,3.653383 0.707104,7.306767 1.060656,10.96015" },

  { label: "right_foot",
    style: "fill:#000000;fill-opacity:1;stroke:#5c5c5c;stroke-width:2.99999332;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;display:inline",
    d: "m 17.831825,30.59868 c 0.06851,1.811013 -3.148743,1.792778 -3.195917,0.05077 -0.06122,-1.898383 3.199505,-1.922132 3.195917,-0.05077 z" },

  { label: "body",
    style: "fill:#ff0000;fill-rule:evenodd;stroke:#5c5c5c;stroke-width:2.99999332;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none",
    d: "m 21.675008,12.17018 c 0.21712,5.550669 -5.103955,10.720313 -10.690296,9.973244 -4.863131,-0.474753 -8.9298055,-5.025377 -8.774656,-9.92725 -0.04523,-4.5368508 3.2420352,-9.0449809 7.805525,-9.8568376 3.975851,-0.8424912 8.391473,1.1047958 10.3049,4.7247316 0.885057,1.5376501 1.375438,3.308943 1.354527,5.086112 z" }
];

var walking = [
  { label: "left_leg",
    style: "fill:none;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1",
    d: "M 12.460156,16.850831 C 9.631729,20.739921 6.8033021,24.629011 3.9748751,28.518101" },

  { label: "left_foot",
    style: "fill:#000000;fill-opacity:1;stroke:#5c5c5c;stroke-width:3;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none",
    d: "M 4.681981,27.81099 C 4.85681,30.19983 1.101459,29.94752 1.508214,27.63024 1.605349,25.44395 4.802017,25.65926 4.681981,27.81099 z" },

  { label: "right_leg",
    style: "fill:none;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1",
    d: "m 23.066757,17.204391 c 1.767767,3.653383 3.535533,7.306767 5.3033,10.96015" },

  { label: "right_foot",
    style: "fill:#000000;fill-opacity:1;stroke:#5c5c5c;stroke-width:3;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none",
    d: "m 29.430717,29.2252 c -0.04774,2.41178 -4.3346,1.31029 -2.91026,-0.7907 0.79013,-1.10519 2.8959,-0.66022 2.91026,0.7907 z" },

  { label: "body",
    style: "fill:#ff0000;fill-rule:evenodd;stroke:#5c5c5c;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none",
    d: "m 27.970621,11.503807 c 0.09878,4.794487 -3.625825,9.254299 -8.244694,9.888541 C 15.282994,22.185422 10.583894,19.322284 9.1090954,14.943452 7.4780985,10.605964 9.2934491,5.2861677 13.201573,2.948285 c 3.892493,-2.53638571 9.452051,-1.6375587 12.397375,2.008774 1.523084,1.7954543 2.381825,4.1636216 2.371673,6.546748 z" }
];

  return [standing, walking];
};

Room.prototype.draw_player = function(player, color) {
  var frames = this.player_frames();

  // set x-y position from player.x, player.y
  return this
    .paper
    .svg_frames(frames)
    .translate(player.x, player.y);
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
    '<input type="text" name="message" id="chat-message" size="60" maxlength="100" />' +
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
