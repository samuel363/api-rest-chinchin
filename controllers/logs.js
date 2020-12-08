'use strict'

const log4js = require("log4js");

log4js.configure({
    appenders: {
      application: {
          type: "file",
          filename: "logs/application.log"
        }
    },
    categories: {
        default: {
            appenders: ["application"],
            level: "all" //"error"
        }
    }
});

const logger = log4js.getLogger("application");

var controller = {
    trace : (text) => logger.trace(text),
    debug : (text) => logger.debug(text),
    info  : (text) => logger.info(text),
    warn  : (text) => logger.warn(text),
    error : (text) => logger.error(text),
    fatal : (text) => logger.fatal(text),
};

module.exports = controller;
