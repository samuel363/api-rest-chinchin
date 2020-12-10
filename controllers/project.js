'use strict'

const ObjectsToCsv = require('objects-to-csv');

const logger = require('./logs');
const fs = require("fs");

let todayString;
let yesterdayString;

let token;
//var binance = require('../services/binance');
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
            logger.info("service_error: readFileToShare: 'application.log' #ERROR: "+err);
            console.log(err);
            return console.log("error_readFileToShare");
        }

        // SHARE_FILE
        // Pactos_Teletrabajo
        sharePoint.saveFile(
            'Logs','application.log', data
        )
        .then(function(result) {
            logger.info("service_success: sharePoint_saveFile");
            console.log("service_success: sharePoint_saveFile");
        })
        .catch(function(err) {
            logger.info("service_error: sharePoint_saveFile #ERROR: "+err);

            console.log(err);
            console.log("error_sharePoint_saveFile");
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
            list_files.push(file);
            console.log(file);
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
            services.getData(result.access_token,todayString,yesterdayString)
            .then(function(data) {
                logger.info("service_success: getData");
                console.log("service_success: getData");

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
                            'Pactos_Teletrabajo',+yesterdayString+'.csv', data
                        )
                        .then(function(result) {
                            logger.info("service_success: sharePoint_saveFile");
                            console.log("service_success: sharePoint_saveFile");

                            //SEND_MAIL
                            services.report(yesterdayString)
                            .then(function(result) {
                                logger.info("service_success: sendMail");
                                console.log("service_success: sendMail");

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
                            console.log("error_sharePoint_saveFile");

                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_sharePoint_saveFile",
                                });
                            }else{
                                return console.log("error_sharePoint_saveFile");
                            }
                        });
                    });


                })
                .catch(function(err) {
                    logger.info("process_error: writeData | #ERROR: "+err);
                    console.log("process_error: writeData | #ERROR: "+err);

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

        const todayString = today.getDate() + '-' +
                        (today.getMonth()+1) + '-' +
                        today.getFullYear();
        const yesterdayString = yesterday.getDate() + '-' +
                            (yesterday.getMonth()+1) + '-' +
                            yesterday.getFullYear();

        //GET_TOKEN
        // services.getToken()
        // .then(function(tokenResult) {
        //     logger.info("service_success: getToken");
        //     console.log("service_success: getToken");

            //GET_DATA
            services.test()
            //services.getData(tokenResult,todayString,yesterdayString)
            .then(function(data) {
                logger.info("service_success: getData");
                console.log("service_success: getData");

                //WRITE_CSV
                writeToCsv(
                    "TEST_"+yesterdayString+'.csv',
                    //data
                    data.data
                )
                .then(function(result){
                    logger.info("process_success: writeData  | File: "+"TEST_"+yesterdayString+".csv");
                    console.log("process_success: writeData  | File: "+"TEST_"+yesterdayString+".csv");

                    // READ_FILE_TO_SHARE
                    fs.readFile('./reports/TEST_'+yesterdayString+'.csv', 'utf8', function (err,data) {
                        if (err) {
                            logger.info("service_error: readFileToShare: 'application.log' #ERROR: "+err);
                            console.log(err);

                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_readFileToShare",
                                });
                            }else{
                                return console.log("error_readFileToShare");;
                            }
                        }

                        // SHARE_FILE
                        sharePoint.saveFile(
                            'Pactos_Teletrabajo','TEST_'+yesterdayString+'.csv', data
                        )
                        .then(function(result) {
                            logger.info("service_success: sharePoint_saveFile");
                            console.log("service_success: sharePoint_saveFile");

                            //SEND_MAIL
                            services.report(yesterdayString)
                            .then(function(result) {
                                logger.info("service_success: sendMail");
                                console.log("service_success: sendMail");

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
                                console.log("error_send_mail");

                                return res.status(502).send({
                                    message: "error_send_mail",
                                });
                            });

                        })
                        .catch(function(err) {
                            logger.info("service_error: sharePoint_saveFile #ERROR: "+err);

                            console.log(err);
                            console.log("error_sharePoint_saveFile");

                            if(res!=undefined){
                                return res.status(502).send({
                                    message: "error_sharePoint_saveFile",
                                });
                            }else{
                                return console.log("error_sharePoint_saveFile");
                            }
                        });
                    });

                })
                .catch(function(err) {
                    logger.info("process_error: writeData | #ERROR: "+err);
                    console.log("process_error: writeData | #ERROR: "+err);

                    return res.status(200).send({
                        message: "error_write_file",
                    });
                });
            })
            .catch(function(err) {
                logger.info("service_error: getToken | #ERROR: "+err);
                console.log("service_error: getToken | #ERROR: "+err);

                return res.status(502).send({
                    message: "get_token_error",
                });
            });

        // // ### ---------------------------------------
        // })
        // .catch(function(err) {
        //     logger.info("service_error: getToken | #ERROR: "+err);
        //     console.log("service_error: getToken | #ERROR: "+err);

        //     return res.status(502).send({
        //         message: "get_token_error",
        //     });
        // });

    },
    test: (req, res) => {
        yesterdayString='12-12-2012'
        //SEND_MAIL
        services.report(yesterdayString)
        .then(function(result) {
            logger.info("service_success: sendMail");
            console.log("service_success: sendMail");

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
            console.log("error_send_mail");

            return res.status(502).send({
                message: "error_send_mail",
            });
        });

    },
    test2: (req, res) => {
        yesterdayString='12-12-2012'

        fs.readFile('./logs/application.log', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            console.log(data);
                return res.status(200).send({
                    message: "success",
                });
        });
        //SHARE_FILE
        //Pactos_Teletrabajo

        // sharePoint.saveFile(
        //     'Logs','application.log', 'test'
        // )
        // .then(function(result) {
        //     logger.info("service_success: sharePoint_saveFile");
        //     console.log("service_success: sharePoint_saveFile");

        //     if(res!=undefined){
        //         return res.status(200).send({
        //             message: "sharePoint_saveFile_success",
        //         });
        //     }else{
        //         console.log("sharePoint_saveFile_success");
        //     }
        // })
        // .catch(function(err) {
        //     logger.info("service_error: sharePoint_saveFile #ERROR: "+err);

        //     console.log(err);
        //     console.log("error_sharePoint_saveFile");

        //     return res.status(502).send({
        //         message: "error_sharePoint_saveFile",
        //     });
        // });

    },
    s1: (req, res) => {
        //GET_TOKEN
        services.getToken()
        .then(function(result) {
            logger.info("service_success: getToken");
            console.log("service_success: getToken");

            token=result.access_token;
            if(res!=undefined){
                return res.status(502).send({
                    message: "service_success: getToken",
                    data: result
                });
            }else{
                return console.log("service_success: getToken");;
            }

        })
        .catch(function(err) {
            logger.info("service_error: getToken | #ERROR: "+err);
            console.log("service_error: getToken | #ERROR: "+err);

            if(res!=undefined){
                return res.status(502).send({
                    message: "get_token_error",
                });
            }else{
                return console.log("get_token_error");;
            }

        });
    },
    s2: (req, res) => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate( today.getDate() - 1);

            todayString = today.getDate() + '-' +
                            (today.getMonth()+1) + '-' +
                            today.getFullYear();
            yesterdayString = yesterday.getDate() + '-' +
                                (yesterday.getMonth()+1) + '-' +
                                yesterday.getFullYear();

            // return res.status(502).send({
            //     message: "test",
            //     token:token,
            //     todayString:todayString,
            //     yesterdayString:yesterdayString,
            // });
            
            //GET_DATA
            services.getData(token,todayString,yesterdayString)
            .then(function(data) {
                logger.info("service_success: getData");
                console.log("service_success: getData");

                if(res!=undefined){
                    return res.status(502).send({
                        message: "service_success: getData",
                        data: data
                    });
                }else{
                    return console.log("service_success: getData");;
                }

            })
            .catch(function(err) {
                logger.info("service_error: getData | #ERROR: "+err);
                console.log("service_error: getData | #ERROR: "+err);

                if(res!=undefined){
                    return res.status(502).send({
                        message: "get_data_error",
                    });
                }else{
                    return console.log("get_data_error");;
                }
            });

    },


};

module.exports = controller;

