var express = require('express');
var router = express.Router();
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cons         = require('consolidate');

var DelayedResponse = require('http-delayed-response');



var a = 0, b =100000;
var resp;

var val="no new data";


function longwait (callback) {

  var i = 0;
  while (a < b && i++ < 100  ) {
    ; // console.log("Number " + a++);
	 
  }

  if (a < b && val =="no new data" ) 
	  setImmediate( longwait , callback );
  else
	  
  {
 //  var rep="5|4|10|25|256|5700107|4294967105|4294966535|678|0|M0,3051 !1234ghj23rt56rt78io45";
 
  console.log("call callback " + a++);
  a=0;
  var val1=val;
  val ="no new data";
 
  callback(0,val1);
 
  }
}







function slowFunction (callback) {

var i = 0;
a=0;
longwait(callback)

}




// GET users listing. 
router.get('/getdata', function(req, res, next) {

 
 	 console.log("getdata");
	  var delayed = new DelayedResponse(req, res);

	  delayed.on('done', function (results) {
		// slowFunction responded within 5 seconds
		 res.write(results);
		res.end();
		

	  }).on('cancel', function () {
		// slowFunction failed to invoke its callback within 5 seconds
		// response has been set to HTTP 202
		console.log("timeout");
		res.write('sorry, this will take longer than expected...');
		res.end();
  		
			
	});

	a=0;
	 slowFunction (delayed.wait(5000) );


});


router.get('/setdata', function(req, res, next) {

   console.log("setdata1");
	val= "5|4|10|25|256|5700107|4294967105|4294966535|678|0|M0,3051 !1234ghj23rt56rt78io45";
		res.write('ok');
		res.end();

});



module.exports = router;
  
  