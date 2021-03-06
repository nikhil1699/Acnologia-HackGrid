 let http = require('http');
 let https = require('https');
 let url = require('url');
 let StringDecoder = require('string_decoder').StringDecoder;
 let config = require('./config');
 let fs = require('fs');
 let handlers = require('./handlers');
 let helpers = require('./helpers');
 let path = require('path');
 let util = require('util');
 let debug = util.debuglog('server');



let server = {};

server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });


server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 };
 server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
   server.unifiedServer(req,res);
 });

 
server.unifiedServer = function(req,res){

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

       
       let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

       chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

       
       let data = {
         'trimmedPath' : trimmedPath,
         'queryStringObject' : queryStringObject,
         'method' : method,
         'headers' : headers,
         'payload' : helpers.parseJsonToObject(buffer)
       };

       
       chosenHandler(data,function(statusCode,payload,contentType){

         // Determine the type of response mainly the fallback to JSON
         contentType = typeof(contentType) == 'string' ? contentType : 'json';

         
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         
         let payloadString = '';
         if(contentType == 'json'){
           res.setHeader('Content-Type', 'application/json');
           payload = typeof(payload) == 'object'? payload : {};
           payloadString = JSON.stringify(payload);
         }

         if(contentType == 'html'){
           res.setHeader('Content-Type', 'text/html');
           payloadString = typeof(payload) == 'string'? payload : '';
         }

         if(contentType == 'favicon'){
           res.setHeader('Content-Type', 'image/x-icon');
           payloadString = typeof(payload) !== 'undefined' ? payload : '';
         }

         if(contentType == 'plain'){
           res.setHeader('Content-Type', 'text/plain');
           payloadString = typeof(payload) !== 'undefined' ? payload : '';
         }

         if(contentType == 'css'){
           res.setHeader('Content-Type', 'text/css');
           payloadString = typeof(payload) !== 'undefined' ? payload : '';
         }

         if(contentType == 'png'){
           res.setHeader('Content-Type', 'image/png');
           payloadString = typeof(payload) !== 'undefined' ? payload : '';
         }

         if(contentType == 'jpg'){
           res.setHeader('Content-Type', 'image/jpeg');
           payloadString = typeof(payload) !== 'undefined' ? payload : '';
         }

         
         res.writeHead(statusCode);
         res.end(payloadString);

         
         if(statusCode == 200){
           debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
         } else {
           debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
         }
       });

   });
 };

 
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/edit' : handlers.accountEdit,
  'account/deleted' : handlers.accountDeleted,
  'session/create' : handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'checks/all' : handlers.checksList,
  'checks/create' : handlers.checksCreate,
  'checks/edit' : handlers.checksEdit,
  'ping' : handlers.ping,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/checks' : handlers.checks,
  'favicon.ico' : handlers.favicon,
  'public' : handlers.public
};

 
server.init = function(){
  
  server.httpServer.listen(config.httpPort,function(){
    console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
  });

  
  server.httpsServer.listen(config.httpsPort,function(){
    console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
  });
};


 
 module.exports = server;
