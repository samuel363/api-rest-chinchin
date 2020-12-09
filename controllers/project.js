'use strict'

const ObjectsToCsv = require('objects-to-csv');

const logger = require('./logs');
const fs = require("fs");

let todayString;
let yesterdayString;

//var binance = require('../services/binance');
var services = require('../services/achs');

const writeToCsv = async (fileName,data) => {
    const csv = new ObjectsToCsv(data);
  // Save to file:
    await csv.toDisk('./reports/'+fileName);
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
        .then(function(tokenResult) {
            logger.info("service_success: getToken");
            console.log("service_success: getToken");

            //GET_DATA
            services.getData(tokenResult,todayString,yesterdayString)
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
        })
        .catch(function(err) {
            logger.info("service_error: getToken | #ERROR: "+err);
            console.log("service_error: getToken | #ERROR: "+err);

            return res.status(502).send({
                message: "get_token_error",
            });
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
};

module.exports = controller;

