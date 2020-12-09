'use strict'

require('dotenv').config();

const propertiesReader = require('properties-reader');
var properties = propertiesReader('./application.properties', {writer: { saveSections: true }});
var projectController  = require('./controllers/project');

var app = require('./app');
const cron = require('node-cron');

const PORT = properties.get('main.app.port');
const HOST = properties.get('main.app.host');

try {
    cron.schedule(properties.get('main.app.crontime'), function() {
        projectController.runService();
        //TEST
        // projectController.testRunService();
    });

    app.listen(PORT, HOST, () => {
        console.log(`Running on http://${HOST}:${PORT}`);
    });
} catch (e) {
    console.log("ERROR!... :"+e);
}

