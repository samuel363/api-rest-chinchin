'use strict'

var express = require('express');
var ProjectController  = require('../controllers/project');

var router = express.Router();

//RUTAS
router.get('/',ProjectController.home)
router.get('/list-files',ProjectController.listFilesCSV);
router.get('/download',ProjectController.download);
router.get('/run-service',ProjectController.initialRunService);
router.get('/run-service-by-range',ProjectController.runByRageDate);

//TEST
router.get('/test-run-service',ProjectController.testRunService);

module.exports = router;