const args = require("yargs").argv;
const date = require("date-and-time");
const axios = require('axios');
const await = require("await");
const papa = require('papaparse')
const fs = require('fs');


//Fetch USD values from cryptocompare
const getValuesInUsdFromApi = async () => {
    let cryptocompareURL =
        "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD&api_key=309729a45aac06161e354b898a9a997d6b1652587387e41c9745ebb8293f9368";
    try {
        return await axios.get(cryptocompareURL)
    } catch (error) {
        console.error(error)
    }
}

//Get the latest portfolio value per token in USD
const getLatestPortfolioInUSD = () => {
    return new Promise((resolve) => {
        let output = [];
        let btcOutput = { token: "BTC", amount: 0 };
        let ethOutput = { token: "ETH", amount: 0 };
        let xrpOutput = { token: "XRP", amount: 0 };

        let btcWithdrawal = 0;
        let btcDeposit = 0;
        let ethWithdrawal = 0;
        let ethDeposit = 0;
        let xrpWithdrawal = 0;
        let xrpDeposit = 0;

        stream = fs.createReadStream('transactions.csv')
            .once('open', function () {
                papa.parse(stream, {
                    worker: true,
                    step: function (results) {

                        let timestamp = results.data[0]
                        let transaction_type = results.data[1]
                        let token = results.data[2]
                        let amount = results.data[3]

                        switch (token) {
                            case "BTC":
                                if (transaction_type === 'WITHDRAWAL') {
                                    btcWithdrawal = btcWithdrawal + Number(amount)
                                } else if (transaction_type === 'DEPOSIT') {
                                    btcDeposit = btcDeposit + Number(amount)
                                }
                                btcOutput.amount = (btcDeposit - btcWithdrawal).toFixed(2);
                                break;
                            case "ETH":
                                if (transaction_type === 'WITHDRAWAL') {
                                    ethWithdrawal = ethWithdrawal + Number(amount)
                                } else if (transaction_type === 'DEPOSIT') {
                                    ethDeposit = ethDeposit + Number(amount)
                                }
                                ethOutput.amount = (ethDeposit - ethWithdrawal).toFixed(2);
                                break;
                            case "XRP":
                                if (transaction_type === 'WITHDRAWAL') {
                                    xrpWithdrawal = xrpWithdrawal + Number(amount)
                                } else if (transaction_type === 'DEPOSIT') {
                                    xrpDeposit = xrpDeposit + Number(amount)
                                }
                                xrpOutput.amount = (xrpDeposit - xrpWithdrawal).toFixed(2);
                                break;
                            default:
                                break;
                        }

                    },
                    complete: function () {
                        //get conversion rate from compare crypto api
                        let compareCrypto = getValuesInUsdFromApi();
                        compareCrypto.then(
                            (response) => {
                                btcOutput.amount = (btcOutput.amount * response.data.BTC.USD).toFixed(2);
                                ethOutput.amount = (ethOutput.amount * response.data.ETH.USD).toFixed(2);
                                xrpOutput.amount = (xrpOutput.amount * response.data.XRP.USD).toFixed(2);

                                output.push(btcOutput);
                                output.push(ethOutput);
                                output.push(xrpOutput);
                                resolve(output);
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                    }
                });
            })
            .on('error', function (err) {
                process.send(['search-failed', 'read']);
                console.log(err);
            });
    });

}

//get portfolio of a given token that user provides.
const getLatestsPortfolioPerTokenInUsd = () => {
    getLatestPortfolioInUSD().then((result) => {
        //Filter result of getLatestPortfolioInUSD() by token
        const perToken = result.filter((data) => {
            return data.token === args.token;
        })
        console.log(perToken);
    })
}

//get portfolio of a given token using date that user provides.
const getPortfolioPerDateInUsd = () => {
    return new Promise((resolve) => {
        let output = [];
        let btcOutput = { token: "BTC", amount: 0 };
        let ethOutput = { token: "ETH", amount: 0 };
        let xrpOutput = { token: "XRP", amount: 0 };

        let btcWithdrawal = 0;
        let btcDeposit = 0;
        let ethWithdrawal = 0;
        let ethDeposit = 0;
        let xrpWithdrawal = 0;
        let xrpDeposit = 0;

        stream = fs.createReadStream('book.csv')
            .once('open', function () {
                papa.parse(stream, {
                    worker: true,
                    step: function (results) {

                        let timestamp = results.data[0]
                        let transaction_type = results.data[1]
                        let token = results.data[2]
                        let amount = results.data[3]

                        //Get date from timestamp
                        let date = new Date(timestamp * 1000) //convert to milliseconds
                        let dateFromCsv = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()

                        switch (token) {
                            case "BTC":
                                if (dateFromCsv === args.date) {
                                    if (transaction_type === 'WITHDRAWAL') {
                                        btcWithdrawal = btcWithdrawal + Number(amount)
                                    } else if (transaction_type === 'DEPOSIT') {
                                        btcDeposit = btcDeposit + Number(amount)
                                    }
                                }
                                btcOutput.amount = (btcDeposit - btcWithdrawal).toFixed(2);
                                break;
                            case "ETH":
                                if (dateFromCsv === args.date) {
                                    if (transaction_type === 'WITHDRAWAL') {
                                        ethWithdrawal = ethWithdrawal + Number(amount)
                                    } else if (transaction_type === 'DEPOSIT') {
                                        ethDeposit = ethDeposit + Number(amount)
                                    }
                                }
                                ethOutput.amount = (ethDeposit - ethWithdrawal).toFixed(2);
                                break;
                            case "XRP":
                                if (dateFromCsv === args.date) {
                                    if (transaction_type === 'WITHDRAWAL') {
                                        xrpWithdrawal = xrpWithdrawal + Number(amount)
                                    } else if (transaction_type === 'DEPOSIT') {
                                        xrpDeposit = xrpDeposit + Number(amount)
                                    }
                                }
                                xrpOutput.amount = (xrpDeposit - xrpWithdrawal).toFixed(2);
                                break;
                            default:
                                break;
                        }

                    },
                    complete: function () {
                        //get conversion rate from compare crypto api
                        let compareCrypto = getValuesInUsdFromApi();
                        compareCrypto.then(
                            (response) => {
                                btcOutput.amount = (btcOutput.amount * response.data.BTC.USD).toFixed(2);
                                ethOutput.amount = (ethOutput.amount * response.data.ETH.USD).toFixed(2);
                                xrpOutput.amount = (xrpOutput.amount * response.data.XRP.USD).toFixed(2);

                                output.push(btcOutput);
                                output.push(ethOutput);
                                output.push(xrpOutput);
                                resolve(output);
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                    }
                });
            })
            .on('error', function (err) {
                process.send(['search-failed', 'read']);
                console.log(err);
            });
    });

}

//get porfolio by date and token.
const getPortfolioByDateAndToken = () => {
    getPortfolioPerDateInUsd().then((result) => {
        //Filter result of getPortfolioPerDateInUsd() by token
        const perToken = result.filter((data) => {
            return data.token === args.token;
        })
        console.log(perToken);
    })
}

//Geting user input from the terminal.
if (args.token === undefined && args.date === undefined) {
    //No inputs provided
    console.log("Return the latest portfolio value per token in USD");
    getLatestPortfolioInUSD().then((result) => {
        console.log(result);
    });
} else if (args.token != undefined && args.date === undefined) {
    //Token provided as input. Get portfolio of a given token
    console.log("Return the latest portfolio value in USD for " + args.token);
    getLatestsPortfolioPerTokenInUsd();
} else if (args.token == undefined && args.date != undefined) {
    //Date provided as input. Get portfolio by date.
    console.log("Return portfolio by date")
    getPortfolioPerDateInUsd().then((result) => {
        console.log(result);
    })
} else if (args.token != undefined && args.date != undefined) {
    //Date and token provided as input.
    console.log("Return " + args.token + " portfolio for the date " + args.date)
    getPortfolioByDateAndToken();
}