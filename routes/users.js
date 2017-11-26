var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {
	   //     var url_parts = url.parse(req.url,true);
  //  console.log(req.param('Getscope'));
  if (req.param('-*Execute.(*Getscope)(void)')=='')
  {console.log("getpara 1");
     var rep=[]
	 rep["StartStopScope"]=1
   res.json( {"StartStopScope":1} );

  }
 
});


module.exports = router;
