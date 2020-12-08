'use strict'

const ObjectsToCsv = require('objects-to-csv');

const logger = require('./logs');
const fs = require("fs");

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
    saveCsvFile: function(req, res){

        binance()
        .then(function(binanceData) {
            //console.log(binanceData);
            console.log("binanceData Loaded Success!...");

            writeToCsv(
                'testttt.csv',
                binanceData.data
            )
            .then(function(binanceData) {
                console.log("writeFile Success!...");
                return res.status(200).send({
                    message: "success_write_file",
                });
            })
            .catch(function(err) {
                console.log(err);
                return res.status(200).send({
                    message: "error_write_file",
                });
            });

        })
        .catch(function(err) {
            console.log(err);
            return res.status(200).send({
                message: "error_load_data",
            });
        });

    },
    download: (req, res) => res.download('./reports/'+req.query.date+'.csv'),
    sendMail: function(req, res){

        logger.warn("running service: sendMail( Date="+"12/12/2012"+" ) ...");

        services.report("12/12/2012")
        .then(function(result) {
            logger.info("service_success: sendMail");
            console.log("service_success: sendMail");

            return res.status(200).send({
                message: "send_mail_success",
            });
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
    test: function(req, res){
        logger.warn("service_success: test");
        services.test()
        .then(function(result) {
            logger.info("service_success: test_success");
            return res.status(200).send({
                message: "success",
                data: result
            });
        })
        .catch(function(err) {
            console.log(err);
            logger.error("service_error: test_error");

            return res.status(502).send({
                message: "error_test",
            });
        });

    },
    test2: function(req, res){
        console.log(err);
    },
    testPost: function(req, res){

        services.test_post()
        .then(function(binanceData) {
            return res.status(200).send({
                message: "success",
                data: binanceData
            });
            })
        .catch(function(err) {
            console.log(err);
            return res.status(502).send({
                message: "error_test",
            });
        });

    },
    runService: (req, res) => {

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
                    yesterdayString+'.csv',
                    //data
                    data.data
                )
                .then(function(result){
                    logger.info("process_success: writeData");
                    console.log("process_success: writeData");

                    //SEND_MAIL
                    services.report(yesterdayString)
                    .then(function(result) {
                        logger.info("service_success: sendMail");
                        console.log("service_success: sendMail");

                        return res.status(200).send({
                            message: "all_process_success",
                        });
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

    }

};

module.exports = controller;

