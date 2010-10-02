Raphael.fn.svg_frames = function() {
  var paper = this;

  var Frame = function(paths) {
    this.paths = paths;
    this.elements = [];
  };

  Frame.prototype.draw = function () {
    function attrs_from_string(str) {
      var attrs = {};
      str.split(/;/).
        forEach(function(pair) {
          var kv = pair.split(/:/);
          attrs[kv[0]] = kv[1];
        });
      return attrs;
    }

    for (var i=0; i<this.paths.length; i++) {
      var attrs = this.paths[i];

      var el = paper
        .path(attrs.d)
        .attr(attrs_from_string(attrs.style))
        .hide();

      this.elements.push(el);
    };

    this.node = this.elements[this.elements.length - 1].node;
  };

  var methods = ['remove', 'show', 'hide', 'stop'];
  for (var i=0; i<methods.length; i++) {
    Frame.prototype[methods[i]] = function(method) {
      return function () {
        for (var j=0; j<this.elements.length; j++) {
          this.elements[j][method]();
        };
      };
    }(methods[i]);
  }


  Frame.prototype.translate = function(x, y, ms) {
    var el = this.elements[this.elements.length - 1];

    // offset between end coordinates and current location
    var x_diff = x - el.getBBox().x;
    var y_diff = y - el.getBBox().y;

    for (var i=0; i<this.elements.length; i++) {
      var obj = this.elements[i];
      // calculate path starting from absolute coordinates and moving
      // relatively from there by the offset
      var p = "M " + obj.getBBox().x + " " + obj.getBBox().y +
             " l " + x_diff          + " " + y_diff;

       // animate along that path
      if (ms && ms > 50)
        obj.animateAlong(p, ms);
      else
        obj.translate(x_diff, y_diff);
    };
  };

  Frame.prototype.getBBox = function() {
    return this.elements[this.elements.length - 1].getBBox();
  };

  Frame.prototype.onAnimation = function(fn) {
    this.elements[this.elements.length - 1].onAnimation(fn);
  };


  function raphael_delegator(method) {
    return function() {
      for (var i=0; i<this.list.length; i++) {
        this.list[i][method]();
      }
    };
  }

  var frames = {
    list: [],
    interval: 333,
    paper: paper,

    add: function(frame_list) {
      for (var i=0; i<frame_list.length; i++) {
        var frame = new Frame(frame_list[i]);
        frame.draw();
        this.list.push(frame);
      }
      this.node = this.list[0].node;
    },

    remove: raphael_delegator('remove'),

    hide: raphael_delegator('hide'),

    stop: raphael_delegator('stop'),

    animate: function(new_attrs, ms, easing) {
      if (new_attrs.cx || new_attrs.cy) {
        var x = new_attrs.cx || this.getCenter().x
           ,y = new_attrs.cy || this.getCenter().y;
        if (easing) {
          var c = this.paper.circle(this.getCenter().x,
                                    this.getCenter().y,
                                    20);
          if (this.toggler) clearTimeout(this.toggler);
          this.hide();
          var self = this;
          c.animate({cx: x, cy: y}, ms, easing, function () {
            c.remove();
            self.translate(x, y);
            self.list[0].show();
          });
        }
        else {
          this.translate(x, y, ms);
        }
      }
    },

    translate: function(x, y, ms) {
      for (var i=0; i<this.list.length; i++) {
        this.list[i].translate(x, y, ms);
      }
      if (ms && ms > 50) this.toggle_frames(ms);
      return this;
    },

    toggle_frames: function(ms, count) {
      var self = this;
      if (!count) count=1;

      var frames = this.list;
      var current_frame = count % frames.length;

      for (var i=0; i<frames.length; i++) {
        if (i == current_frame) {
          frames[i].show();
        }
        else {
          frames[i].hide();
        }
      }

      if (count < Math.floor(ms / self.interval)) {
        var fn = function(){self.toggle_frames(ms, count+1);};
        this.toggler = setTimeout(fn, self.interval);
      }
    },

    getBBox: function() {
      return this.list[0].getBBox();
    },

    getCenter: function() {
      var bounding_box = this.getBBox();
      return {
        x: Math.floor(bounding_box.width/2) + bounding_box.x,
        y: Math.floor(bounding_box.height/2) + bounding_box.y
      };
    },

    // attr: function() {
    //   // delegate to last object in first frame
    //   var obj = this.list[0][this.list[0].length-1];
    //   console.debug(arguments);
    //   return obj.attr.apply(obj, arguments);
    // },

    onAnimation: function(fn) {
      this.list[0].onAnimation(fn);
    }

  };

  if (arguments.length > 1)
    frames.add(arguments);
  else
    frames.add(arguments[0]);

  frames.list[0].show();

  return frames;
};
