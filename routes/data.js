var express = require('express');
var router = express.Router();
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cons         = require('consolidate');

var DelayedResponse = require('http-delayed-response');




var reqn=0
var val="no new data";

var breaktime=0;

function longwait (delayed,callback,a,b) {

  var i = 0;
  while (a < b && i++ < 10  ) {
    // console.log("Number " + a++);
	 a++;
  }

  if (a < b && breaktime ==0  && delayed["break"]==0)  
  { //console.log("Number " + a + " req:"+ delayed["instance"]);
		setImmediate( longwait , delayed,callback,a,b );
  }

	 //  var rep="5|4|10|25|256|5700107|4294967105|4294966535|678|0|M0,3051 !1234ghj23rt56rt78io45";
  if (breaktime==1)
  {
	  console.log("call callback send tmout " + a+ " req:"+delayed["instance"]);
 
  }
  
  if (breaktime ==2 )
	  {
	  console.log("call callback data " + a+ " req:"+delayed["instance"]);
	  var val1=val;

	  callback(0,val1);
	  }
	  
}







function slowFunction (delayed,callback) {

var i = 0;
var a=0 
var b=10000000000
longwait(delayed,callback,a,b)

}




// GET users listing. 
router.get('/getdata', function(req, res, next) {

 
 	console.log("getdata");
	var delayed = new DelayedResponse(req, res);
	delayed["instance"]=reqn;
	delayed["break"]=0;

	   delayed.on('abort', function (err) {
			console.log("client disconnect n" + delayed["instance"]);
			delayed["break"]=1;
			res.end();
		  });

  
  
	  delayed.on('done', function (results) {
		// slowFunction responded within 5 seconds
	//	 res.write(results);
	//	res.end();
		 res.send(results);

	  }).on('cancel', function () {
		// slowFunction failed to invoke its callback within 5 seconds
		// response has been set to HTTP 202
		console.log("timeout");
		delayed["break"]=1;
	
		res.write('no new data');
	
		res.end();
			
		
 			
	});

	breaktime=0;
	
	 console.log("call slowfn req:"+reqn);
	 slowFunction (delayed,delayed.wait(8000) );
	reqn++;

});


router.get('/setdata', function(req, res, next) {

   console.log("setdata1");
	val= "5|4|10|25|256|5700107|4294967105|4294966535|678|0|M0,3051 !1234ghj23rt56rt78io45";
	breaktime=2;
	res.write('ok');
		res.end();

});

router.get('/setrealdata', function(req, res, next) {

   console.log("setrealdata");
	val= req.param("var")
 console.log(val);
	breaktime=2;
	res.write('ok');
		res.end();

});


module.exports = router;
  
  