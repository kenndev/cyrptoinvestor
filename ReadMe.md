# Crypto Investor Portfolio Calculator

## Project setup
```
npm install
```

## Project description
A command line program that does the following:

Given no parameters, return the latest portfolio value per token in USD

Given a token, return the latest portfolio value for that token in USD

Given a date, return the portfolio value per token in USD on that date

Given a date and a token, return the portfolio value of that token in USD on that date


## Project design and decisions.
Given that the file, transactions.csv, contains a lot of data, over a million plus, to iterrate through the file and read it's contents can't be done at one go since node js will run out memory. The data needs to be broken down to chunks which can then be iterated. To do this, I use Papaparse which is a CSV parser package.

To get the latest portfolio, I simply get all deposits and withdrawals of a token and get the difference and then multiply the result to the exchange rate provided by cryptocompare.

Given a date and a token, return the portfolio value of that token in USD on that date
node index.js --date=25/10/2019 --token=ETH

Given a date, return the portfolio value per token in USD on that date
node index.js --date=25/10/2019


Given a token, return the latest portfolio value for that token in USD
node index.js --token=BTC

Given no parameters, return the latest portfolio value per token in USD
node index.js


