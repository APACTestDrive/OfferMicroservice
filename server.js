var express = require('express');
var app = express();
var Client = require('node-rest-client').Client;
var client = new Client();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

var SVCHOST = process.env.SVCHOST || "127.0.0.1";
var PORT = process.env.PORT || 8080;
var router = express.Router();

router.use(function (request, response, next) {
  console.log("REQUEST:" + request.method + "   " + request.url);
  console.log("BODY:" + JSON.stringify(request.body));
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

/**
 * GET /ptmgt/v1/offers/:id
 * Returns the detail of an offer
 */
router.route('/ptmgt/v1/offers/:id').get(function (request, response) {
  var id = request.params.id;
  console.log("GET OFFER BY ID:" + id);
  client.get("http://" + SVCHOST + "/crm/resources/offer/" + id, function(data, remoteResponse) {
	var offer = { id: data.offerid, name: data.offername, points: data.points, message: data.message, productid: data.productid ,productname: data.productname, productprice: data.productprice, productimage: data.productimage, productdesc: data.productdesc };
    response.json(offer);
  }).on('error', function(err) {
      console.log('something went wrong on the request', err.request.options);
      response.status(500).send("something went wrong on the request");
  });
});

app.use('/', router);
app.listen(PORT);
