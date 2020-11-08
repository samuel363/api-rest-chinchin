'use strict'

require('dotenv').config();

var app = require('./app');
var port = 3700;

try {
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
} catch (e) {
    console.log("ERROR!...");
}

