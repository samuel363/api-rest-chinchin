'use strict'

var bodyParser = require('body-parser');
var express = require('express');
var ProjectController  = require('./controllers/project');

var app = express();

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS

// //RUTAS
var project_routes = require("./routes/project")

app.use('/api',project_routes);
app.get('/*',ProjectController.home)

module.exports = app;
