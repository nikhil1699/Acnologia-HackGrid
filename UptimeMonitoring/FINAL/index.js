
var server = require('./lib/server');
var workers = require('./lib/workers');


var app = {};


app.init = function(){


  server.init();

  // Start the workers
  workers.init();

};

// Self executing
app.init();


// Export the app
module.exports = app;
