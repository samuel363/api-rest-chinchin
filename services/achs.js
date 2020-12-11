'use strict'

var https = require('https');
var Promise = require('promise');

const propertiesReader = require('properties-reader');
var properties = propertiesReader('./application.properties', {writer: { saveSections: true }});

function httpRequest(params,data=undefined) {
  return new Promise(function(resolve, reject) {
      var req = https.request(params, function(res) {
          // reject on bad status
          console.log(`statusCode: ${res.statusCode}`)

          if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error('statusCode=' + res.statusCode));
          }
          // cumulate data
          var body = [];
          res.on('data', function(chunk) {
              body.push(chunk);
          });

          // resolve on end
          res.on('end', function() {
              //console.log("---end--")
              try {
                  if (body.length) body = JSON.parse( Buffer.concat(body).toString() );
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

      //console.log(params);
      if (data!=undefined){
        req.write(data);
      }

      req.end();
  });

}

async function getData(token,dateFrom,dateTo){

  var options = {
    protocol: properties.get('services.app.protocol')+':',
    timeout: 0,
    //host: properties.get('services.app.host'),
    path: properties.get('services.app.data.path')+"/"+dateFrom+"/"+dateTo,
    hostname: properties.get('services.app.host'),
    port: 443,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': ' Bearer '+token
    },
  };

  console.log("Loading Data! ...");
  console.log("...");

  return httpRequest(options);

}

async function getToken(){

  var body = JSON.stringify(
    {
      "Usuario": properties.get('services.app.user'),
      "Password": properties.get('services.app.password')
    }
  );

  var options = {
    protocol: properties.get('services.app.protocol')+':',
    timeout: 0,
    host: properties.get('services.app.host'),
    path: properties.get('services.app.token.path'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // body: {
    //   "Usaurio": "achs",
    //   "Password": "bdqXGynh8V"
    // }
  };

  return httpRequest(options,body);

}

async function report(date,dataAmount){

  const MAIL_HTML = `
  <html>
    <body>
        <p>
          Se informa que se ha generado el reporte del dia ${date}, con un total de ${dataAmount} registros.
        </p>
        <p>
          <a href="https://achs.sharepoint.com/teams/PactosdeTeletrabajo/Pactos_Teletrabajo/Forms/AllItems.aspx">
            SharePoint - Pactos de Teletrabajo
          </a>
        </p>
    </body>
  </html>`;

  var body = JSON.stringify({
    'Destinatario': properties.get('report.main.app.emails'),
    'Asunto': 'Reporte del dia '+date,
    'Mensaje': MAIL_HTML
  });

  var options = {
    protocol: properties.get('services.app.protocol')+':',
    timeout: 0,
    host: properties.get('report.mail.host'),
    port: properties.get('report.mail.port'),
    path: properties.get('report.mail.path'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      'Accept': 'application/json',
    },
    // json: true,
    // body: body
  };

  // console.log(options);

  return httpRequest(options,body);

}

module.exports.getData = getData;
module.exports.getToken = getToken;
module.exports.report = report;

//TEST ----------------------------------------
async function test(){
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
  return httpRequest(options);
}
module.exports.test = test;
//---------------------------------------------