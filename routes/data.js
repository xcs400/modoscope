var express = require('express');
var router = express.Router();
var DelayedResponse = require('http-delayed-response');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cons         = require('consolidate');


var a = 0, b =5;
var resp;

function numbers(res) {
  var i = 0;
  while (a < b && i++ < 1) {
    console.log("Number " + a++);
	res.write(a);
  }
  if (a < b) 
	  setImmediate(numbers(res));
  else
	  
  {
   var rep="4|4|10|25|256|5700107|4294967105|4294966535|678|0|M0,3051 !1234ghj23rt56rt78io45";
  res.send(rep);
  }
}




function slowFunction (callback) {
  // let's do something that could take a while...
    var rep="4|4|10|25|256|5700107|4294967105|4294966535|678|0|M0,3051 !1234ghj23rt56rt78io45";
  results(rep);
}


/* GET users listing. */
router.get('/', function(req, res, next) {
   
  if (req.param('getdata')=='1')
  {  console.log("getdata");
	/*var trace= {"center":tableau[0],
				 "pretrig":tableau[1],
				 "seuiltrigger":tableau[2],
				 "NBBUFFER_":tableau[3],
				 "NB_ELEMENT_":tableau[4],
				 "cycle":tableau[5],
				 "moyenne":tableau[6],
				 "min":tableau[7],
				 "max":tableau[8] ,
	 			 "voie":tableau[9] ,
				 "sample":signal};
	 */
	
 var delayed = new DelayedResponse(req, res);

  delayed.on('done', function (results) {
    // slowFunction responded within 5 seconds
    res.json(results);
  }).on('cancel', function () {
    // slowFunction failed to invoke its callback within 5 seconds
    // response has been set to HTTP 202
    res.write('sorry, this will take longer than expected...');
    res.end();
  });

  slowFunction(delayed.wait(5000));
  
  
   }
		
});




module.exports = router;
