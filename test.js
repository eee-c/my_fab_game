#!/usr/bin/env node

var assert = require("assert")
  , puts = require( "sys" ).puts;

function test( build ) {
  var tests = build.tests
    , count = tests.length
    , results = [ 0, 0 ];

  puts( "Running " + count + " tests..." )

  build.tests.forEach( function( test ) {
    test.call( function( ok ) {
      results[ +ok ]++
      puts( test.name + ": " + ok );

      if ( results[ 0 ] + results[ 1 ] == count ) {
        puts(
          [ "Done. "
          , results[ 1 ]
          , " passed, "
          , results[ 0 ]
          , " failed."
          ].join("")
        )
      }
    });
  })
}

var target_module = require('./lib/player_from_querystring');
test(target_module);

    target_module = require('./lib/init_comet');
test(target_module);
