var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;
};

Player.prototype.notify = function(evt) {
  switch(evt.type) {
    case "click":
      this.stop();
      this.walk_to(evt.x, evt.y);
      this.notify_server({id:this.id,x:evt.x, y:evt.y});
      break;
  }
};

Player.prototype.stop = function () {
  this.drawable.stop();
  this.label.stop();

  this.x = this.drawable.attrs.cx;
  this.y = this.drawable.attrs.cy;
};

Player.prototype.walk_to = function(x, y) {
  this.label.attr({cx: this.x, cy: this.y +10});

  var p = "M"+ this.x + " " + this.y +
          "L" +     x + " " +      y;
  this.drawable.animateAlong(p, 3000);

  var pl = "M"+ this.x + " " + this.y + 10 +
           "L" +     x + " " +      y + 10;
  this.label.animateAlong(p, 3000);

  this.x = x;
  this.y = y;
};

Player.prototype.quit = function() {
  this.drawable.remove();
  this.label.remove();
  delete this.x;
  delete this.y;
  delete this.id;
};

Player.prototype.attach_drawable = function(drawable) {
  this.drawable = drawable;
  this.label = drawable.paper.text(this.x, this.y + 10, this.id);
};

Player.prototype.notify_server = function(change) {
  $.post("/move", JSON.stringify(change));
};
