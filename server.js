const express = require('express');
const http = require('http');

const cors = require('cors');

const accountSid = 'AC9bd2e6def213f15ed3e588235695905c';
const authToken = '7548caaee6500d72b0382444016ca827';
const client = require('twilio')(accountSid, authToken);

const app = express();

const numbers = ['+584125534496', '+584128883349']

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cors());

function getBitcoinPrice() {
    var options = {
        host: 'api.coindesk.com',
        port: 80,
        path: '/v1/bpi/currentprice.json',
        method: 'GET'
    }

    http.request(options, function(res) {
        var body = '';
        res.on('data', data=>{
            body+= data;
        });
        res.on('end', ()=>{
            var prices = JSON.parse(body);
            var price = prices.bpi.USD.rate_float;
            if (price <= 43000) {
                sendMessageBuy(price);
            } else if (price >= 55000) {
                sendMessageSell(price);
            } else {
                console.log('BTC is stable ' + price);
            };
        })
    }).on('error', (err, result)=>{
        if (err){
            return console.log('Error while trying get prices '+err);
        }
    }).end();
    
}

app.get('/*', (req, res, next) => {
});


var minutes = 1, the_interval = minutes * 60 * 1000;


function sendMessageBuy(price) {
    numbers.forEach(number => {
        client.messages.create({
         body: `El precio del BTC es ${price} \n \n COMPRAAAAAA`,
         from: '+13175264523',
         to: number
       }).then(message => console.log(`Message send to ${number}, ` + message.sid)).done();
    });
   clearInterval(intervalId);
}

function sendMessageSell(price) {
    numbers.forEach(number => {

        client.messages.create({
         body: `El precio del BTC es ${price} \n \n VENDEEEEEEE`,
         from: '+13175264523',
         to: number
       }).then(message => console.log(`Message send to ${number}, ` + message.sid)).done();
    });
   clearInterval(intervalId);
}

//port number
const PORT = 5000;
//start server
app.listen(PORT, () => {
    intervalId = setInterval(function() {
        getBitcoinPrice();
    }, the_interval);
    console.log(`server running on port ${PORT}`)
});

