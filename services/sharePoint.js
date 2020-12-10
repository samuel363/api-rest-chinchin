
'use strict'

var spsave = require("spsave").spsave;

const propertiesReader = require('properties-reader');
var properties = propertiesReader('./application.properties', {writer: { saveSections: true }});

var coreOptions = {
  siteUrl: properties.get('sharepoint.app.url'),
  // notification: true,
  checkin: true,
  checkinType: 1
};

var creds = {
  username: properties.get('sharepoint.app.email'),
  password: properties.get('sharepoint.app.password'),
  domain: properties.get('sharepoint.app.host')
};

async function saveFile(folderName, fileName, fileContent){

  var fileOptions = {
    folder: folderName,
    fileName: fileName,
    fileContent: fileContent
  };

  return spsave(coreOptions, creds, fileOptions)

}

module.exports.saveFile = saveFile;


