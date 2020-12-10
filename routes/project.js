'use strict'

var express = require('express');
var ProjectController  = require('../controllers/project');

var router = express.Router();

//RUTAS
router.get('/',ProjectController.home)
router.get('/list-files',ProjectController.listFilesCSV);
router.get('/download',ProjectController.download);
router.get('/run-service',ProjectController.runService);

//TEST
router.get('/test-run-service',ProjectController.testRunService);
router.get('/test',ProjectController.test2);
router.get('/test_1',ProjectController.s1);
router.get('/test_2',ProjectController.s2);

module.exports = router;