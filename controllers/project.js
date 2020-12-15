'use strict'

const ObjectsToCsv = require('objects-to-csv');

const logger = require('./logs');
const fs = require("fs");

let todayString;
let yesterdayString;
let dataAmount;

var services = require('../services/achs');
var sharePoint = require('../services/sharePoint');

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
            logger.info("service_error: sharePoint_saveLogFile #ERROR: "+err);
            console.log("error_read_log_file_to_share");
            console.log(err);
        });
    });
}

var controller = {
    home: function (req,res){
        return  res.status(200).send(`
            <h1> Bienvenidos al REST API </h1>
            <ul>
                <li> /api/run-service               </li>
                <li> /api/list-files                     </li>
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
    runService: (req, res) => {

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
            services.getData(result.access_token, todayString, yesterdayString)
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
                            logger.info("service_error: readFileToShare: 'application.log' #ERROR: "+err);
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_read_file_to_share",
                                });
                            }else{
                                return console.log("error_read_file_to_share");;
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
                                if(res!=undefined){
                                    return res.status(200).send({
                                        message: "all_process_success",
                                    });
                                }else{
                                    console.log("all_process_success");
                                }
                            })
                            .catch(function(err) {
                                logger.info("service_error: sendMail #ERROR: "+err);
                                console.log(err);
                                shareLogFile();
                                if(res!=undefined){
                                    return res.status(502).send({
                                        message: "error_send_mail",
                                    });
                                }else{
                                    return console.log("error_send_mail");;
                                }
                            });
                        })
                        .catch(function(err) {
                            logger.info("service_error: sharePoint_saveFile #ERROR: "+err);
                            console.log(err);
                            console.log("error_sharePoint_save_file");
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
                    logger.info("process_error: writeData | #ERROR: "+err);
                    console.log("process_error: writeData | #ERROR: "+err);
                    shareLogFile();
                    if(res!=undefined){
                        return res.status(502).send({
                            message: "error_write_file",
                        });
                    }else{
                        return console.log("error_write_file");;
                    }
                });
            })
            .catch(function(err) {
                logger.info("service_error: getData | #ERROR: "+err);
                console.log("service_error: getData | #ERROR: "+err);
                shareLogFile();
                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");;
                }
            });
        })
        .catch(function(err) {
            logger.info("service_error: getToken | #ERROR: "+err);
            console.log("service_error: getToken | #ERROR: "+err);
            shareLogFile();
            if(res!=undefined){
                return res.status(502).send({
                    message: "get_token_error",
                });
            }else{
                return console.log("get_token_error");;
            }
        });

    },
    testRunService: (req, res) => {

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
                            logger.info("service_error: readFileToShare: 'application.log' #ERROR: "+err);
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_read_file_to_share",
                                });
                            }else{
                                return console.log("error_read_file_to_share");;
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
                                if(res!=undefined){
                                    return res.status(200).send({
                                        message: "all_process_success",
                                    });
                                }else{
                                    console.log("all_process_success");
                                }
                            })
                            .catch(function(err) {
                                logger.info("service_error: sendMail #ERROR: "+err);
                                console.log(err);
                                shareLogFile();
                                if(res!=undefined){
                                    return res.status(502).send({
                                        message: "error_send_mail",
                                    });
                                }else{
                                    return console.log("error_send_mail");;
                                }
                            });
                        })
                        .catch(function(err) {
                            logger.info("service_error: sharePoint_saveFile #ERROR: "+err);
                            console.log(err);
                            console.log("error_sharePoint_save_file");
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
                    logger.info("process_error: writeData | #ERROR: "+err);
                    console.log("process_error: writeData | #ERROR: "+err);
                    shareLogFile();
                    if(res!=undefined){
                        return res.status(502).send({
                            message: "error_write_file",
                        });
                    }else{
                        return console.log("error_write_file");;
                    }
                });
            })
            .catch(function(err) {
                logger.info("service_error: getData | #ERROR: "+err);
                console.log("service_error: getData | #ERROR: "+err);
                shareLogFile();
                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");;
                }
            });
        // })
        // .catch(function(err) {
        //     logger.info("service_error: getToken | #ERROR: "+err);
        //     console.log("service_error: getToken | #ERROR: "+err);
        //     shareLogFile();
        //     if(res!=undefined){
        //         return res.status(502).send({
        //             message: "get_token_error",
        //         });
        //     }else{
        //         return console.log("get_token_error");;
        //     }
        // });

    },
    test2RunService: (req, res) => {

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate( today.getDate() - 1);

        todayString = today.getDate() + '-' +
                        (today.getMonth()+1) + '-' +
                        today.getFullYear();
        yesterdayString = yesterday.getDate() + '-' +
                            (yesterday.getMonth()+1) + '-' +
                            yesterday.getFullYear();

        todayString = '20-11-2020';
        yesterdayString = '30-11-2020';

        //GET_TOKEN
        services.getToken()
        .then(function(result) {
            logger.info("service_success: getToken");
            console.log("service_success: getToken");

            //GET_DATA
            dataAmount=0;
            services.getData(result.access_token, todayString, yesterdayString)
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
                            logger.info("service_error: readFileToShare: 'application.log' #ERROR: "+err);
                            console.log(err);
                            shareLogFile();
                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_read_file_to_share",
                                });
                            }else{
                                return console.log("error_read_file_to_share");;
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
                                if(res!=undefined){
                                    return res.status(200).send({
                                        message: "all_process_success",
                                    });
                                }else{
                                    console.log("all_process_success");
                                }
                            })
                            .catch(function(err) {
                                logger.info("service_error: sendMail #ERROR: "+err);
                                console.log(err);
                                shareLogFile();
                                if(res!=undefined){
                                    return res.status(502).send({
                                        message: "error_send_mail",
                                    });
                                }else{
                                    return console.log("error_send_mail");;
                                }
                            });
                        })
                        .catch(function(err) {
                            logger.info("service_error: sharePoint_saveFile #ERROR: "+err);
                            console.log(err);
                            console.log("error_sharePoint_save_file");
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
                    logger.info("process_error: writeData | #ERROR: "+err);
                    console.log("process_error: writeData | #ERROR: "+err);
                    shareLogFile();
                    if(res!=undefined){
                        return res.status(502).send({
                            message: "error_write_file",
                        });
                    }else{
                        return console.log("error_write_file");;
                    }
                });
            })
            .catch(function(err) {
                logger.info("service_error: getData | #ERROR: "+err);
                console.log("service_error: getData | #ERROR: "+err);
                shareLogFile();
                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");;
                }
            });
        })
        .catch(function(err) {
            logger.info("service_error: getToken | #ERROR: "+err);
            console.log("service_error: getToken | #ERROR: "+err);
            shareLogFile();
            if(res!=undefined){
                return res.status(502).send({
                    message: "get_token_error",
                });
            }else{
                return console.log("get_token_error");;
            }
        });

    },

};

module.exports = controller;

