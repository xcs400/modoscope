"use strict";

// require node.js datagram and assert modules
var dgram  = require('dgram');
var assert = require('assert');
var Correlation = require('node-correlation');

/**
 *  node-scope UDP datagram receiver
* Since this is a UDP receiver, it doesn't have connections. It will receive from any source (or multiple sources)
* and it will continue running until the application quits.
* Because node is single threaded a single instance of 'trace' is good enough
* it gets updated whenever a message is received and pased on via the callback. I suppose
* this limits memory allocation churn.
* If it makes sense a new trace object could be allocated for each message.
*/
var NBBUFFER = 25
module.exports = (function() {
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

  /**
   * initialize the receiver
   * @param port           : ip port to listen for messages
   * @param trace_callback : called when a trace is received or on error : trace_callback(err,trace)
   */
 var  duty=0;
  var nm1=0;
  
  function init(port,trace_callback) {

    // needs a port and a callback
    assert.ok(port,"port not defined");
    assert.ok(trace_callback,"trace_callback not defined");

    // create the datagram socket
    sock = dgram.createSocket('udp4');

    // handle socket errors
    sock.on("error",function(err) {
      trace_callback(err);
      sock.close();
    });

    /**
     * receive a message from the embedded system, deconstruct it and pass it on
     * via the trace_callback.      *
     */
    // a
    sock.on("message",function(data,rinfo){
      var offset; // position in the message buffer
      var len;    // number of samples to read from the data buffer
      var i;      // loop index

      // use 'rinfo' if you want to see who sent the message
   //console.log("receiver :  " + JSON.stringify(rinfo, false, null)  );
   
      // 'data' is a mode Buffer. use the node.js API for reading binary data from a Buffer
  
      trace.channel        = 3;   // data.readUInt16BE(0);
//      trace.length         = data.readUInt16BE(2);
      trace.length         = (256)*NBBUFFER;                         // (2*256 sample + 2 words)   *  33 buffer 
 
       trace.sample         = samples;              // reset the sample field to the int16 array in case the callback function changed its value
	   
	   
      // callback to output handler

	
		
	
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

  
	/*  demuliplex
	
		for (i=0;i<NBBUFFER_;i++)
			{
			len=512;
			offset = sizeEntete + center *( 512*2  );   // en byte 
			
			var n= data.readUInt32LE(offset-sizeEntete) ;
			console.log("buff " +  n.toString(16) )
		
	
			
			for(var ii=0;ii<len;ii++) {
				trace.sample[ii+ i * len ] = data.readUInt16LE(offset) >>1;  //div2 pour etre en signé
				offset += 2;
				if ( ii & 1)
					samplesA[ (ii + i * len) >> subsamplingb ]= trace.sample[ii+ i * len ];
						else
					samplesB[ (ii + i * len) >> subsamplingb] = trace.sample[ii+ i * len ];
					
				
					}
					
			center++;
			if (center==NBBUFFER)
				center=0;
			}
*/

	
//	offset = sizeEntete + center * ( 512  );   // en byte 

// trace A	

		


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

		
	  
	  
	  
	  
	  
	/*    for(i=0;i<256*NBBUFFER_ ;i++) 
			ch= ch + " " + trace.sample[i];
		
	  	  console.log("samplesA " +  ch );
  	  console.log("cr"  );
	  */
	/*
	ch="";
	    for(i=0;i<2560 ;i++) 
			ch= ch + " " + samplesB[i];
		
	  	  console.log("samplesB " +  ch );
	
	
	/*
	var cy=0;
	//	var temp= samplesB[2559];
		
		for(var ii=0;ii<MAX_SAMPLES;ii+=8) 
			{
				
			var tmp =( Correlation.calc(samplesB,samplesA)) * 19859/2 ;   //19859 ==1 sur 16 bit
			trace.sample[ MAX_SAMPLES + cy ]= tmp;		
			for (var rr=0;rr<8;rr++)
					trace.sample[MAX_SAMPLES+cy+rr ]= tmp;		
					
	//		console.log("col  "+ cy +" of:"+ +ii +" "+ trace.sample[ MAX_SAMPLES + cy ] + " " +tmp );
		console.log("col  "+ cy +" of:"+ +ii +" "+ trace.sample[ MAX_SAMPLES + cy ]  );
			var temp= samplesA.shift();
			samplesA.push(temp);
			cy+=4;
			}
	 
	*/
	

		trace_callback(null,trace);
    console.log("send ");
 		
//		else
  //  console.log(" skp");
			
		
    });

    sock.on("listening",function(){
      console.log("receiver : listening on port " + port);
    });

    // bind to the expected port
    sock.bind(port,function() {
      console.log('bound to ' + port);
    });

  }

  return {
    init : init
  };
})();
