var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;
}

Player.prototype.notify = function(evt) {
  switch(evt.type) {
    case "click":
      this.stop();
      this.walk_to(evt.offsetX, evt.offsetY);
      this.notify_server({id:this.id,x:evt.offsetX, y:evt.offsetY});
      break;
  }
};

Player.prototype.stop = function () {
  if (this.walker) clearTimeout(this.walker);
};

Player.prototype.walk_to = function(x, y, angle) {
  if (!angle) {
    var x_diff = x - this.x;
    var y_diff = -(y - this.y);
    var distance = Math.sqrt(x_diff*x_diff + y_diff*y_diff);
    angle = Math.atan2(y_diff, x_diff);
    if (angle < 0) angle += Math.PI*2;

    console.debug("x_diff: "+x_diff+", y_diff"+y_diff+", angle: "+angle);
  }

  var x_diff = 2*Math.cos(angle);
  var y_diff = 2*Math.sin(angle);
  // console.debug("x_diff: "+x_diff+", y_diff"+y_diff+", angle: "+angle);

  if (this.x != x) this.x = this.x + x_diff;
  if (this.y != y) this.y = this.y - y_diff;

  if (Math.abs(this.x-x) + Math.abs(this.y - y) > 5) {
   var self = this;
   this.walker = setTimeout(function(){self.walk_to(x,y,angle)}, 25);
  }
};

Player.prototype.notify_server = function(change) {
  $.post("http://localhost:4011/move", JSON.stringify(change));
};
