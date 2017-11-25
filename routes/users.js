var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {
	   //     var url_parts = url.parse(req.url,true);
  //  console.log(req.param('Getscope'));
  if (req.param('-*Execute.(*Getscope)(void)')=='')
  {console.log("getpara");
     var rep="5555";
   res.send(rep);

  }
 
});


module.exports = router;
