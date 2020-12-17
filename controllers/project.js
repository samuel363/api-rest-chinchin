'use strict'

const ObjectsToCsv = require('objects-to-csv');

const logger = require('./logs');
const fs = require("fs");
const propertiesReader = require('properties-reader');
var properties = propertiesReader('./application.properties', {writer: { saveSections: true }});

let todayString;
let yesterdayString;
let dataAmount;
let resultSuccess;

var services = require('../services/achs');
var sharePoint = require('../services/sharePoint');
var sleep = require('sleep-promise');

const writeToCsv = async (fileName,data) => {
    const csv = new ObjectsToCsv(data);
  // Save to file:
    await csv.toDisk('./reports/'+fileName);
}

function shareLogFile(){
    fs.readFile('./logs/application.log', 'utf8', function (err,data) {
        if (err) {
            logger.info("service_error: readLogFileToShare: 'application.log' #ERROR: "+err);
            console.log(err);
            return console.log("error_read_log_file_to_share");
        }
        // SHARE_FILE
        sharePoint.saveFile(
            'Logs','application.log', data
        )
        .then(function(result) {
            logger.info("service_success: sharePoint_saveLogFile");
            console.log("service_success: sharePoint_saveLogFile");
        })
        .catch(function(err) {
            logger.error("service_error: sharePoint_saveLogFile #ERROR: "+err);
            console.log("error_read_log_file_to_share");
            console.log(err);
        });
    });
}

var controller = {
    home: function (req,res){
        return  res.status(200).send(`
            <h1> Bienvenido al REST API - Pactos de Teletrabajo </h1>
            <ul>
                <li> /api/run-service  </li>
                <li> /api/run-service-by-range?from=dd-mm-yyyy&to=dd-mm-yyyy  </li>
                <li> /api/list-files  </li>
                <li> /api/download?date=dd-mm-yyyy  </li>
            </ul>
        `);
    },
    listFilesCSV: (req, res) => {

        const list_files = [];

        fs.readdirSync('./reports/').forEach(file => {
            if (file != '.gitignore') list_files.push(file);
        });

        return res.status(200).send({
            message: "list_files_success",
            files: list_files
        });

    },
    download: (req, res) => res.download('./reports/'+req.query.date+'.csv'),
    runService: async (req, res) => {

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate( today.getDate() - 1);

        todayString = today.getDate() + '-' +
                        (today.getMonth()+1) + '-' +
                        today.getFullYear();
        yesterdayString = yesterday.getDate() + '-' +
                            (yesterday.getMonth()+1) + '-' +
                            yesterday.getFullYear();

        //GET_TOKEN
        services.getToken()
        .then(function(result) {
            logger.info("service_success: getToken");
            console.log("service_success: getToken");

            //GET_DATA
            dataAmount=0;
            services.getData(result.access_token, yesterdayString, todayString)
            .then(function(data) {
                dataAmount=data.length;
                logger.info("service_success: getData");
                logger.info("data_amount: "+dataAmount);
                console.log("service_success: getData");
                console.log("data_amount: "+dataAmount);
                //WRITE_CSV
                writeToCsv(
                    yesterdayString+'.csv',
                    data
                )
                .then(function(result){
                    logger.info("process_success: writeData  | File: "+yesterdayString+".csv");
                    console.log("process_success: writeData  | File: "+yesterdayString+".csv");

                    // READ_FILE_TO_SHARE
                    fs.readFile('./reports/'+yesterdayString+'.csv', 'utf8', function (err,data) {
                        if (err) {
                            logger.info("service_error: readFileToShare: 'application.log' | #ERROR: "+err);
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_read_file_to_share",
                                });
                            }else{
                                return console.log("error_read_file_to_share");
                            }
                        }

                        // SHARE_FILE
                        sharePoint.saveFile(
                            'Pactos_Teletrabajo',yesterdayString+'.csv', data
                        )
                        .then(function(result) {
                            logger.info("service_success: sharePoint_saveFile");
                            console.log("service_success: sharePoint_saveFile");

                            //SEND_MAIL
                            services.report(yesterdayString,dataAmount)
                            .then(function(result) {
                                logger.info("service_success: sendMail");
                                console.log("service_success: sendMail");
                                shareLogFile();
                                resultSuccess = true;
                                if(res!=undefined){
                                    return res.status(200).send({
                                        message: "all_process_success",
                                    });
                                }else{
                                    console.log("all_process_success");
                                }
                            })
                            .catch(function(err) {
                                logger.error("service_error: sendMail | "+err);
                                console.log(err);
                                shareLogFile();
                                if(res!=undefined){
                                    return res.status(502).send({
                                        message: "error_send_mail",
                                    });
                                }else{
                                    return console.log("error_send_mail");
                                }
                            });
                        })
                        .catch(function(err) {
                            logger.error("service_error: sharePoint_saveFile | Error: "+err);
                            console.log("error_sharePoint_save_file");
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_sharePoint_save_file",
                                });
                            }else{
                                return console.log("error_sharePoint_save_file");
                            }
                        });
                    });

                })
                .catch(function(err) {
                    logger.info("process_error: writeData | Error: "+err);
                    console.error("process_error: writeData | Error: "+err);
                    shareLogFile();
                    if(res!=undefined){
                        return res.status(502).send({
                            message: "error_write_file",
                        });
                    }else{
                        return console.log("error_write_file");
                    }
                });
            })
            .catch(function(err) {
                logger.error("service_error: getData | "+err);
                console.log("service_error: getData | "+err);
                shareLogFile();
                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");
                }
            });
        })
        .catch(function(err) {
            logger.info("service_error: getToken | "+err);
            console.log("service_error: getToken | "+err);
            shareLogFile();
            if(res!=undefined){
                return res.status(502).send({
                    message: "get_token_error",
                });
            }else{
                return console.log("get_token_error");
            }
        });

    },
    testRunService: async (req, res, i=3) => {
        if (i<3) return console.log("testRunService i:"+i);
        console.log("testRunService i:"+i);

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate( today.getDate() - 1);

        todayString = today.getDate() + '-' +
                        (today.getMonth()+1) + '-' +
                        today.getFullYear();
        yesterdayString = yesterday.getDate() + '-' +
                            (yesterday.getMonth()+1) + '-' +
                            yesterday.getFullYear();

        // //GET_TOKEN
        // services.getToken()
        // .then(function(result) {
        //     logger.info("service_success: getToken");
        //     console.log("service_success: getToken");

            //GET_DATA
            dataAmount=0;
            // services.getData(result.access_token, todayString, yesterdayString)
            services.test()
            .then(function(data) {
                dataAmount=data.data.length;
                logger.info("service_success: getData");
                logger.info("data_amount: "+dataAmount);
                console.log("service_success: getData");
                console.log("data_amount: "+dataAmount);
                //WRITE_CSV
                writeToCsv(
                    yesterdayString+'.csv',
                    data.data
                )
                .then(function(result){
                    logger.info("process_success: writeData  | File: "+yesterdayString+".csv");
                    console.log("process_success: writeData  | File: "+yesterdayString+".csv");

                    // READ_FILE_TO_SHARE
                    fs.readFile('./reports/'+yesterdayString+'.csv', 'utf8', function (err,data) {
                        if (err) {
                            logger.info("service_error: readFileToShare: 'application.log' | #ERROR: "+err);
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_read_file_to_share",
                                });
                            }else{
                                return console.log("error_read_file_to_share");
                            }
                        }

                        // SHARE_FILE
                        sharePoint.saveFile(
                            'Pactos_Teletrabajo',yesterdayString+'.csv', data
                        )
                        .then(function(result) {
                            logger.info("service_success: sharePoint_saveFile");
                            console.log("service_success: sharePoint_saveFile");

                            //SEND_MAIL
                            services.report(yesterdayString,dataAmount)
                            .then(function(result) {
                                logger.info("service_success: sendMail");
                                console.log("service_success: sendMail");
                                shareLogFile();
                                resultSuccess = true;
                                console.log('---> resultSuccess :'+resultSuccess);
                                if(res!=undefined){
                                    return res.status(200).send({
                                        message: "all_process_success",
                                    });
                                }else{
                                    console.log("all_process_success");
                                }
                            })
                            .catch(function(err) {
                                logger.error("service_error: sendMail | "+err);
                                console.log(err);
                                shareLogFile();
                                if(res!=undefined){
                                    return res.status(502).send({
                                        message: "error_send_mail",
                                    });
                                }else{
                                    return console.log("error_send_mail");
                                }
                            });
                        })
                        .catch(function(err) {
                            logger.error("service_error: sharePoint_saveFile | Error: "+err);
                            console.log("error_sharePoint_save_file");
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_sharePoint_save_file",
                                });
                            }else{
                                return console.log("error_sharePoint_save_file");
                            }
                        });
                    });

                })
                .catch(function(err) {
                    logger.info("process_error: writeData | Error: "+err);
                    console.error("process_error: writeData | Error: "+err);
                    shareLogFile();
                    if(res!=undefined){
                        return res.status(502).send({
                            message: "error_write_file",
                        });
                    }else{
                        return console.log("error_write_file");
                    }
                });
            })
            .catch(function(err) {
                logger.error("service_error: getData | "+err);
                console.log("service_error: getData | "+err);
                shareLogFile();
                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");
                }
            });
        // })
        // .catch(function(err) {
        //     logger.info("service_error: getToken | "+err);
        //     console.log("service_error: getToken | "+err);
        //     shareLogFile();
        //     if(res!=undefined){
        //         return res.status(502).send({
        //             message: "get_token_error",
        //         });
        //     }else{
        //         return console.log("get_token_error");
        //     }
        // });

    },
    runByRageDate: async (req, res) => {

        todayString = req.query.to;
        yesterdayString = req.query.from;

        //GET_TOKEN
        services.getToken()
        .then(function(result) {
            logger.info("service_success: getToken");
            console.log("service_success: getToken");

            //GET_DATA
            dataAmount=0;
            services.getData(result.access_token, yesterdayString, todayString)
            .then(function(data) {
                dataAmount=data.length;
                logger.info("service_success: getData");
                logger.info("data_amount: "+dataAmount);
                console.log("service_success: getData");
                console.log("data_amount: "+dataAmount);
                //WRITE_CSV
                writeToCsv(
                    yesterdayString+'_'+todayString+'.csv',
                    data
                )
                .then(function(result){
                    logger.info("process_success: writeData  | File: "+yesterdayString+'_'+todayString+".csv");
                    console.log("process_success: writeData  | File: "+yesterdayString+'_'+todayString+".csv");

                    // READ_FILE_TO_SHARE
                    fs.readFile('./reports/'+yesterdayString+'_'+todayString+'.csv', 'utf8', function (err,data) {
                        if (err) {
                            logger.info("service_error: readFileToShare: 'application.log' | #ERROR: "+err);
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_read_file_to_share",
                                });
                            }else{
                                return console.log("error_read_file_to_share");
                            }
                        }

                        // SHARE_FILE
                        sharePoint.saveFile(
                            'Pactos_Teletrabajo',yesterdayString+'_'+todayString+'.csv', data
                        )
                        .then(function(result) {
                            logger.info("service_success: sharePoint_saveFile");
                            console.log("service_success: sharePoint_saveFile");

                            //SEND_MAIL
                            services.report(yesterdayString+'_'+todayString,dataAmount)
                            .then(function(result) {
                                logger.info("service_success: sendMail");
                                console.log("service_success: sendMail");
                                shareLogFile();
                                resultSuccess = true;
                                if(res!=undefined){
                                    return res.status(200).send({
                                        message: "all_process_success",
                                    });
                                }else{
                                    console.log("all_process_success");
                                }
                            })
                            .catch(function(err) {
                                logger.error("service_error: sendMail | "+err);
                                console.log(err);
                                shareLogFile();
                                if(res!=undefined){
                                    return res.status(502).send({
                                        message: "error_send_mail",
                                    });
                                }else{
                                    return console.log("error_send_mail");
                                }
                            });
                        })
                        .catch(function(err) {
                            logger.error("service_error: sharePoint_saveFile | Error: "+err);
                            console.log("error_sharePoint_save_file");
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_sharePoint_save_file",
                                });
                            }else{
                                return console.log("error_sharePoint_save_file");
                            }
                        });
                    });

                })
                .catch(function(err) {
                    logger.info("process_error: writeData | Error: "+err);
                    console.error("process_error: writeData | Error: "+err);
                    shareLogFile();
                    if(res!=undefined){
                        return res.status(502).send({
                            message: "error_write_file",
                        });
                    }else{
                        return console.log("error_write_file");
                    }
                });
            })
            .catch(function(err) {
                logger.error("service_error: getData | "+err);
                console.log("service_error: getData | "+err);
                shareLogFile();
                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");
                }
            });
        })
        .catch(function(err) {
            logger.info("service_error: getToken | "+err);
            console.log("service_error: getToken | "+err);
            shareLogFile();
            if(res!=undefined){
                return res.status(502).send({
                    message: "get_token_error",
                });
            }else{
                return console.log("get_token_error");
            }
        });

    },
    serviceSuccessLoop: async (iteration, req, res) => {
        console.log('Execution attempt report number '+iteration);
        logger.info('Execution attempt report number '+iteration);

        //controller.testRunService(req, res, iteration)
        controller.runService(req, res)
        .then((result)=>{
            console.log('result :'+result);
            console.log('---> resultSuccess :'+resultSuccess);
            console.log('===>> IF :'+(iteration >= 5 || resultSuccess));
            if (iteration >= 5 || resultSuccess){
                return result;
            }else{
                logger.info('waiting 30 minutes ...');
                console.log('waiting 30 minutes ...');
                sleep(properties.get('main.app.time.sleep')).then(function() {
                    if (!(iteration >= 5 || resultSuccess)) return controller.serviceSuccessLoop(iteration+1,req,res);
                });
            }
        })
    },
    initialRunService: (req, res) => {
        console.log('Initial Run Service..');
        logger.info('Initial Run Service..');
        resultSuccess=false;
        return controller.serviceSuccessLoop(1,req,res);
    },
};

module.exports = controller;

