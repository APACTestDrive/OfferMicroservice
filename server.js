var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var oracledb = require('oracledb');
oracledb.autoCommit = true;

var connectionProperties = {
  user: process.env.DBAAS_USER_NAME || "loyalty",
  password: process.env.DBAAS_USER_PASSWORD || "Welcome_1",
  connectString: process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "localhost:1521/orcl.oracle.com"
};

function doRelease(connection) {
  connection.release(function (err) {
    if (err) {
      console.error(err.message);
    }
  });
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

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

// To-do: Let's get a quick preview of all offers
// router.route('/ptmgt/v1/offers').get(function (request, response) {
//   console.log("GET ALL OFFERS");
//
// })

/**
 * GET /ptmgt/v1/offers/:id
 * Returns the detail of an offer
 */
router.route('/ptmgt/v1/offers/:id').get(function (request, response) {
  console.log("GET OFFER BY ID:" + request.params.id);
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }

    var id = request.params.id;
    connection.execute("SELECT offers.id, offername, points, message, productname, productprice, productimage, productdesc, productid FROM offers, product WHERE offers.id = :id AND product.id = offers.productid",
      [id],
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        console.log("RESULTSET:" + JSON.stringify(result));
        if (result.rows.length === 1) {

          var offer = { id: result.rows[0].ID, name: result.rows[0].OFFERNAME, points: result.rows[0].POINTS, message: result.rows[0].MESSAGE, productid: result.rows[0].PRODUCTID ,productname: result.rows[0].PRODUCTNAME, productprice: result.rows[0].PRODUCTPRICE, productimage: result.rows[0].PRODUCTIMAGE, productdesc: result.rows[0].PRODUCTDESC };

          response.json(offer);
          doRelease(connection);

        } else {
          response.end();
        }
      });
  });
});

app.use('/', router);
app.listen(PORT);

console.log("Server started in port:" + PORT + ", using connection: " + JSON.stringify(connectionProperties));
