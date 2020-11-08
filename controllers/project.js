'use strict'

var binance = require('../services/binance');

var coinBS = {
    "s": "BSUSDT",
    "st": "TRADING",
    "b": "BS",
    "q": "USDT",
    "qn": "Bolivares",
    "l": 0.000001
}

var coinPTR = {
    "s": "PTRUSDT",
    "st": "TRADING",
    "b": "PTR",
    "q": "USDT",
    "qn": "Petros",
    "l": 60
}

function filterData (data,coinsCodes){
    if (data==undefined) return [];
    var flagBS = false;
    var flagPTR = false;
    var result = data.filter(f=>{
        if( f.q == "USDT" && coinsCodes.indexOf(f.b)!= -1){
            if (f.b=="BS") flagBS = true;
            if (f.b=="PTR") flagPTR = true;
            return f;
        }
    });

    if(!flagBS && coinsCodes.indexOf("BS")!= -1) result.push(coinBS);
    if(!flagPTR && coinsCodes.indexOf("PTR")!= -1) result.push(coinPTR);

    return result;
}
function calculate (dataCoins,amount){

    var result=[];
    dataCoins.filter(f=>{
        result.push(
            {
                "s": f.s,
                "st": f.st,
                "b": f.b,
                "q": f.q,
                "qn": f.qn,
                "price": f.l * amount,
            }
        );
    });

    return result;
}

var controller = {
    home: function (req,res){
        return  res.status(200).send(`
            <h1>Bienvenidos al REST API </h1>
            <p>
                Los servicios disponibles son los siguientes:
            </p>
            <ul>
                <li>/api/get-coins-usd</li>
                <li>
                    /api/get-amount-change
                    <br>
                    parametros:
                    <ul>
                        <ol>
                            amount 
                        </ol>
                        <ol>
                            coinsCode 
                        </ol>
                    </ul>
                </li>
            </ul>
        `);
    },
    saveProject: function(req, res){
        //var exchange = new Exchange();
        const exchange = {
            id: db.length + 1,
            "s": "BNBBTC",
            "st": "TRADING",
            "b": "BNB",
            "q": "BTC",
            "ba": "",
            "qa": "฿",
            "i": 0.01,
            "ts": 1e-7,
            "an": "BNB",
            "qn": "Bitcoin",
            "o": 0.0018662,
            "h": 0.0019256,
            "l": 0.0018322,
            "c": 0.0018589,
            "v": 929177.41,
            "qv": 1742.86553,
            "y": 0,
            "as": 929177.41,
            "pm": "BTC",
            "pn": "BTC",
            "cs": 152665937,
            "tags": //[
                "pos",
                //"mining-zone"
            //],
            "pom": false,
            "pomt": null,
            "etf": false
        };

        db.push(exchange);

        return res.status(200).send({
            message: "saveProject"
        });
    },
    getDataUSD: function(req, res){
        var coinsCodes=["BTC","ETH","DASH","PTR","BS","EUR"];

        return res.status(200).send({
            message: "success",
            data: filterData(binance().data,coinsCodes)
        });

    },
    getAmountChange: function(req, res){
            
        if(req.query.amount==undefined){
            return res.status(404).send({
                message: "error",
                data: "param: 'amount' is required"
            });
        }
        if(req.query.coinsCode==undefined){
            return res.status(404).send({
                message: "error",
                data: "param: 'coinsCode' is required"
            });
        }

        var dataCoins = filterData(binance().data,req.query.coinsCode);

        return res.status(200).send({
            message: "success",
            data: calculate(dataCoins,req.query.amount)
        });
    }
};

module.exports = controller;

