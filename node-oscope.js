"use strict";
var express      = require('express');
var path         = require('path');
//var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cons         = require('consolidate');

var routes    = require('./routes/index');
var users     = require('./routes/users');
var data     = require('./routes/data');
var socket    = require('./lib/socket');
var receiver  = require('./lib/receiver');
var debug     = require('debug')('ploty:server');
var port      = process.env.PORT || '8080';
//var DelayedResponse = require('http-delayed-response');

// create express application
var app = express();
app.set('port', port);

// create server
var server = require('http').Server(app);

// connect socket.io to server
var io = require('socket.io')(server);



// view engine setup
app.engine('html',cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/data', data);
app.use('/users', users);






// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/

// error handlers

// development error handler
// will print stacktrace
/*

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

// ================================================================
// start server
// ================================================================
console.log('http on : ' + port.toString());
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// ================================================================
// socket.io support
// ================================================================
socket.init(io);

// ================================================================
// datagram receiver
// ================================================================
receiver.init(process.env.OSCOPE_PORT || '9900',socket.send);

// =================================================================
// support functions for express
// =================================================================
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = (typeof addr === 'string') ? 'pipe ' + addr  : 'port ' + addr.port;
  debug('Listening on ' + bind);
}





//---------------------------------------------------

const net = require('net');

const PORT = 8888;
const ADDRESS = '127.0.0.1';

let servermbed = net.createServer(onClientConnectedmbed);
servermbed.listen(PORT, ADDRESS);


function onClientConnectedmbed(socket) {

  

  // Giving a name to this client
  let clientName = `${socket.remoteAddress}:${socket.remotePort}`;

  // Logging the message on the server
  console.log(`${clientName} connected.`);

  // Triggered on data received by this client
  socket.on('data', (data) => { 

  
  var NBBUFFER = 25
  
  var MAX_SAMPLES = 256 * 2 * NBBUFFER;                            // sized so one trace message can fit in an ethernet MTU
  var MAX_SAMPLES_tot = 256 * 3 * NBBUFFER;                            // sized so one trace message can fit in an ethernet MTU
 
 var sock;                                         // socket to receive messages on
  var samples = new Int16Array(MAX_SAMPLES_tot);        // array of int16_t's to use in the trace

  var subsamplingb= 3;
  var subsampling= 8;
  
 var samplesA = Array(MAX_SAMPLES/subsampling);        // array of int16_t's to use in the trace
 var samplesB = Array(MAX_SAMPLES/subsampling);        // array of int16_t's to use in the trace

  // there is a single instance of variable 'trace'.
  var trace = {
    channel         : 0,     // display channel : 1,2
    length          : 0,     // unsigned 16 bit integer, number of samples, 
    sample          : samples
  };

      
    // getting the string message and also trimming
    // new line characters [\r or \n]
  //  let m = data.toString().replace(/[\n\r]*$/, '');
  //   console.log(`${clientName} said: ${m}`);

		
	   var offset; // position in the message buffer
      var len;    // number of samples to read from the data buffer
      var i;      // loop index

   
      trace.channel        = 3;   // data.readUInt16BE(0);

      trace.length         = (256)*NBBUFFER;                         // (2*256 sample + 2 words)   *  33 buffer 
 
       trace.sample         = samples;              // reset the sample field to the int16 array in case the callback function changed its value
	   
		
	  var center=data.readUInt8(0) ;	
	  console.log("center  :" + center); 
	
	  var pretrig=data.readUInt8(4) ;	
	  console.log("pretrig  :" + pretrig); 

	  var triglevel=data.readUInt16LE(8) ;	
	  console.log("triglevel :" + triglevel); 

	  var NBBUFFER_=data.readUInt32LE(12) ;	
	  console.log("NBBUFFER_ :" + NBBUFFER_); 

  	  var NB_ELEMENT_=data.readUInt32LE(16) ;	
	  console.log("NB_ELEMENT_ :" + NB_ELEMENT_); 

	    var cycle=data.readUInt32LE(20) ;	
	  console.log("cycle :" + cycle); 

	  var sizeEntete=24;
		  
	  
	for (i=0;i<pretrig;i++)
				{	center--;
				if (center<0)
					center=NBBUFFER_-1;
				}
	var memocenter=center;
  console.log("memocenter :" + memocenter); 

 
   center=memocenter;
	offset = sizeEntete + center *  512  ;   // en byte 

		
	for (i=0;i<256* NBBUFFER_   ;i++)
			{
	
			trace.sample[ i ] = data.readUInt16LE(offset) >>1 ;  //div2 pour etre en signé
			offset += 2;
			
			if (offset >= sizeEntete+ (512* NBBUFFER_) )
				{
				offset = sizeEntete  ;   // 0 
				}
	
			
			}
		
// trace B	
  center=memocenter;
	offset = sizeEntete + center *  512 +   (512* NBBUFFER_) ;   // en byte 
	
	for (i=0;i<256* NBBUFFER_   ;i++)
			{
			trace.sample[ i+ 256* NBBUFFER_  ] = data.readUInt16LE(offset) >>1 ;  //div2 pour etre en signé
			offset += 2;
					
			
			if (offset >= sizeEntete+ (512* NBBUFFER_) +  512* NBBUFFER_)
				{
				offset = sizeEntete +   (512* NBBUFFER_) ;   // en byte 
				}
			
			}
			
			trace.sample[ pretrig * 256 ]  =32767;
	//		trace.sample[ pretrig *256 +1] =-32767;

 	console.log("lA " +  samplesA.length );
		console.log("lB " +  samplesB.length );
		console.log("MAX_SAMPLES " +  MAX_SAMPLES );
		  
	  var ch="";
 	  
	  
	 var ii= 0;
		for( ii= 0 ;ii< (256*NBBUFFER_) ;ii++) 
			{
			trace.sample[ 256 *2 * NBBUFFER_  +  ii  ]=  data.readUInt16LE(sizeEntete + (1024* NBBUFFER_) + ii*2)>>1;	
			
			}
	
				
	   ch="";
	    for(i=0;i<(256*NBBUFFER_)   ;i+=8) 
		{if (  trace.sample[256 *2 * NBBUFFER +  i] >32700 )
			ch= ch + " " + trace.sample[256 *2 * NBBUFFER_ +  i];
		//if (i== 512 ) 
		//	i=250*NBBUFFER_;
		}
	  	  console.log("samples " +  ch );
	  	  console.log("i " +  i );

		  console.log("cr----------------------------------------"  );

		
    // notifing the client
    socket.write(`We got your message (${m}). Thanks!\n`);
  });
  
  // Triggered when this client disconnects
  socket.on('end', () => {
    // Logging this message on the server
    console.log(`${clientName} disconnected.`);
  });
}

