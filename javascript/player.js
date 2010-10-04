var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;

  this.uniq_id = "" +
    this.id +
    "-" +
    Math.floor(Math.random()*10) +
    Math.floor(Math.random()*10) +
    Math.floor(Math.random()*10) +
    Math.floor(Math.random()*10);

  this.direction = { x: 1, y: 0 };

  this.initial_walk = true;

  this.faye = new Faye.Client('/faye');

  var self = this;
  var clientAuth = {
    outgoing: function(message, callback) {
      // Leave non-data messages alone
      if (message.channel.indexOf('/meta/') === 0)
        return callback(message);

      // Add ext field if it's not present
      if (!message.ext) message.ext = {};

      // Set the auth token
      message.ext.authToken = self.uniq_id;

      // Carry on and send the message to the server
      return callback(message);
    }
  };
  this.faye.addExtension(clientAuth);
};

Player.radius = 15;
Player.shadow_distance = Player.radius + 10;
Player.max_walk = Math.sqrt(500*500 + 500*500);
Player.time_to_max_walk = 8 * 1000;

Player.prototype.attrs = function() {
  return { id: this.id, x: this.x, y: this.y, _id: this.uniq_id };
};

Player.prototype.notify = function(evt) {
  switch(evt.type) {
    case "click":
      this.faye.publish("/players/move", {id:this.id, x:evt.x, y:evt.y});
      break;
    case "message":
      this.faye.publish("/players/chat", {id:this.id, say:evt.value});
      break;
    default:
      console.debug("[notify] type: " + evt.type + " value: " + evt.value);
  }
};


Player.prototype.stop = function () {
  this.avatar.stop();

  this.x = this.avatar.getBBox().x;
  this.y = this.avatar.getBBox().y;
};

Player.prototype._bounce_away = function(from_x, from_y) {
  this.mid_bounce = true;

  var x = from_x - 1.5*Player.radius*this.direction.x,
      y = from_y - 1.5*Player.radius*this.direction.y;

  this.faye.publish('/players/bounce', {id: this.id, x: x, y: y});
};

Player.prototype.bounce_to = function(x, y) {
  this.stop();

  var self = this;
  this.avatar.animate({cx: x, cy: y}, 500, "bounce");
  setTimeout(function(){ self.mid_bounce = false; }, 1000);

  this.x = x;
  this.y = y;
};


Player.prototype.walk_to = function(x, y) {
  this.stop();

  var x_diff = x - this.x;
  var y_diff = y - this.y;
  var distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
  this.direction = {x: x_diff/distance, y: y_diff/distance};

  var time = Player.time_to_max_walk * ( distance / Player.max_walk );

  if (this.frames()) {
    this.avatar.translate(x, y, time);
  }
  else {
    var p = "M" + Math.floor(this.x) + " " + Math.floor(this.y) +
           " L" +                 x  + " " +                 y;

    this.avatar.animateAlong(p, time);
  }

  var self = this;
  setTimeout(function() {self.initial_walk=false;}, 2*1000);

  this.x = x;
  this.y = y;
};

Player.prototype.say = function(message) {
  var self = this;

  if (this.balloon) this.balloon.remove();

  this.balloon = this.avatar.paper
    .text(this.x, this.y - Player.shadow_distance, message)
    .attr({"font-size": 12});
  setTimeout(function(){self.balloon.remove();}, 10*1000);
};

Player.prototype.quit = function() {
  this.avatar.remove();
  this.label.remove();
  delete this.x;
  delete this.y;
  delete this.id;
};

Player.prototype.frames = function() {
  return typeof(player_frames) === "undefined" ? undefined : player_frames;
};

Player.prototype.center = function() {
  if (this.frames()) {
    return this.avatar.getCenter();
  }
  else {
    return {
       x: this.avatar.attr("cx"),
       y: this.avatar.attr("cy")
    };
  }
};

Player.prototype.attach_avatar = function(avatar) {
  var self = this;
  this.avatar = avatar;
  this.label = avatar.paper
    .text(this.x, this.y + Player.shadow_distance, this.id)
    .attr({"font-size": 12});

  avatar.node.is_player_circle = true;

  var animation_count = 0;
  avatar.onAnimation(function(){
    self.label.attr({x: self.center().x, y: self.center().y + Player.shadow_distance});

    if (self.balloon) {
      self.balloon.attr({x: avatar.getBBox().x, y: avatar.getBBox().y - Player.shadow_distance});
    }

    var c_x = self.center().x +
              $(self.avatar.paper.canvas).parent().offset().left -
              $(document).scrollLeft() +
              1.1 * self.direction.x * Player.radius;

    var c_y = self.center().y +
              $(self.avatar.paper.canvas).parent().offset().top -
              $(document).scrollTop() +
              1.1 * self.direction.y * Player.radius;

    var c_el = document.elementFromPoint(c_x, c_y);

    // console.log(c_el);
    // console.log("initial_walk: " + self.initial_walk);
    // console.log("mid_bounce: " + self.mid_bounce);
    // console.log("is_player_circle: " + c_el.is_player_circle);

    if (!self.initial_walk &&
        !self.mid_bounce &&
        c_el.is_player_circle &&
        c_el != self.avatar.node) {
      // console.debug(self.direction);
      // console.debug("Colliding element:");
      // console.debug(c_el);
      // console.debug("Me:");
      // console.debug(self.avatar);
      self._bounce_away(c_x, c_y);
    }
  });
};
