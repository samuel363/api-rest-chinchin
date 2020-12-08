'use strict'

var express = require('express');
var ProjectController  = require('../controllers/project');

var router = express.Router();

//RUTAS
router.get('/',ProjectController.home)
router.get('/list-files',ProjectController.listFilesCSV);
router.get('/download',ProjectController.download);
router.get('/run-service',ProjectController.runService);

//=========================
//TEST
router.get('/save-csv',ProjectController.saveCsvFile);
router.get('/send-mail',ProjectController.sendMail);

router.get('/test',ProjectController.test);
router.get('/test-post',ProjectController.testPost);

module.exports = router;