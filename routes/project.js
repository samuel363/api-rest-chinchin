'use strict'

var express = require('express');
var ProjectController  = require('../controllers/project');

var router = express.Router();

//RUTAS
router.get('/',ProjectController.home)
router.get('/get-coins-usd',ProjectController.getDataUSD);
router.get('/get-amount-change',ProjectController.getAmountChange);

module.exports = router;