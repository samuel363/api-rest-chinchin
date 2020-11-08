'use strict'

var https = require('https');
var Promise = require('promise');

var data=[];

var options = {
  protocol: "https:",
  timeout: 0,
  host: 'www.binance.com',
  path: '/exchange-api/v1/public/asset-service/product/get-products',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json', 
    'Accept': 'application/json',
  },
  //json:true
};

function httpRequest(params) {
  return new Promise(function(resolve, reject) {
      var req = https.request(params, function(res) {
          // reject on bad status
          if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error('statusCode=' + res.statusCode));
          }
          // cumulate data
          var body = [];
          res.on('data', function(chunk) {
              //console.log("---data--")
              body.push(chunk);
          });
          // resolve on end
          res.on('end', function() {
              //console.log("---end--")
              try {
                  body = JSON.parse(Buffer.concat(body).toString());
              } catch(e) {
                  reject(e);
              }
              resolve(body);
          });
      });
      // reject on request error
      req.on('error', function(err) {
          // This is not a "Second reject", just a different sort of failure
          //console.log("---error--")
          reject(err);
      });
      // IMPORTANT
      req.end();
  });

}

httpRequest(options)
.then(function(binanceData) {
  console.log(binanceData);
  data=binanceData;
})
.catch(function(err) {
  console.log(err);
});

function getData(){
  return data;
}

module.exports = getData;
