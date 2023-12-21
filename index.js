// Import essential libraries 
const { log } = require('console');
const express = require('express'); 
const { link } = require('fs');
const app = express(); 
const path = require('path'); 
const { nextTick } = require('process');
const router = express.Router();
// setup viewengine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var MomoLink = '';
// Setup essential routes 
router.get('/', function(req, res) { 
    res.render(path.join(__dirname + '/views/index.pug')); 
}); 
router.get('/index', function(req, res) { 
    res.render(path.join(__dirname + '/views/index.pug')); 
    //__dirname : It will resolve to your project folder. 
}); 
router.post('/film', function(req, res, next) { 
    data = req.body;
    id = data.id;
    fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options)
    .then(response => response.json())
    .then(response => {
        console.log(response);
        res.render(path.join(__dirname + '/views/film.pug')); 
    })
    .catch(err => console.error(err));
    res.render(path.join(__dirname + '/views/film.pug'));
});
router.get('/login', function(req, res) { 
    res.render(path.join(__dirname + '/views/login.pug')); 
}); 
router.get('/search', function(req, res) { 
    res.render(path.join(__dirname + '/views/search.pug')); 
}); 
router.get('/upgrade-plan', function(req, res) { 
    res.render(path.join(__dirname + '/views/upgrade-plan.pug')); 
});router.post('/checkout', async function(req,res){
    var partnerCode = "MOMO";
    var accessKey = "F8BBA842ECF85";
    var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    var requestId = partnerCode + new Date().getTime();
    var orderId = requestId;
    var orderInfo = "pay with MoMo";
    var redirectUrl = "http://localhost:8000/index";
    var ipnUrl = "http://localhost:8000/index";
    // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
    var amount = "70000";
    var requestType = "payWithATM"
    var extraData = ""

    // Generate raw signature
    var rawSignature = "accessKey="+accessKey+"&amount=" + amount+"&extraData=" + extraData+"&ipnUrl=" + ipnUrl+"&orderId=" + orderId+"&orderInfo=" + orderInfo+"&partnerCode=" + partnerCode +"&redirectUrl=" + redirectUrl+"&requestId=" + requestId+"&requestType=" + requestType        //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    const crypto = require('node:crypto');
    var signature = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    // Construct request body
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        accessKey : accessKey,
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        extraData : extraData,
        requestType : requestType,
        signature : signature,
        lang: 'en'
    });

    // Create HTTPS request object
    const https = require('https');
    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    const reqd = https.request(options, res => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (body) => {
            console.log('Body: ');
            console.log(body);
            console.log('payUrl: ');
            console.log(JSON.parse(body));
            MomoLink = JSON.parse(body).payUrl;
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    })
    console.log("Sending....")
    reqd.write(requestBody);
    reqd.end();
    setTimeout(() => {
    console.log('Mm: ' + MomoLink);
    res.redirect(MomoLink);
    }, 5000);
})
//add the router 
app.use('/public/stylesheets',express.static(__dirname +'/public/stylesheets'));
app.use('/routes',express.static(__dirname +'/routes'));
app.use('/', router);
app.listen(process.env.port || 8000); 
console.log('Running at Port 8000');