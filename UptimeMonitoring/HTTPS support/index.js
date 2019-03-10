
let http = require('http');
let https = require('https');
let url = require('url');
let StringDecoder = require('string_decoder').StringDecoder;
let config = require('./config');
let fs = require('fs');

let httpServer = http.createServer(function(req,res){
  unifiedServer(req,res);
});

httpServer.listen(config.httpPort,function(){
  console.log('The HTTP server is running on port '+config.httpPort);
});

let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
let httpsServer = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res);
});


httpsServer.listen(config.httpsPort,function(){
 console.log('The HTTPS server is running on port '+config.httpsPort);
});

// All the server logic 
let unifiedServer = function(req,res){

  // Parse the url
 let parsedUrl = url.parse(req.url, true);

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  
  let queryStringObject = parsedUrl.query;

  let method = req.method.toLowerCase();

  let headers = req.headers;

 
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();


      let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      let data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
      };

      chosenHandler(data,function(statusCode,payload){

 
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

     
        payload = typeof(payload) == 'object'? payload : {};

        let payloadString = JSON.stringify(payload);


        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log("Returning this response: ",statusCode,payloadString);

      });

  });
};

// Define all the handlers
let handlers = {};

handlers.sample = function(data,callback){
    callback(406,{'name':'sample handler'});
};


handlers.notFound = function(data,callback){
  callback(404);
};

let router = {
  'sample' : handlers.sample
};
