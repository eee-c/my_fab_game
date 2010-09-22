var puts = require( "sys" ).puts;

Logger = {
  level: 1,

  debug:  function(msg) { if (this.level<1) puts("[DEBUG] " + msg); },
  info:   function(msg) { if (this.level<2)  puts("[INFO] " + msg); },
  warn:   function(msg) { if (this.level<3)  puts("[WARN] " + msg); },
  errror: function(msg) { if (this.level<4)  puts("[ERROR] " + msg); }
};

module.exports = Logger;
