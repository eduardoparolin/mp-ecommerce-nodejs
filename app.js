var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000

var app = express();

const {MercadoPagoConfig, Preference} = require('mercadopago');
// Adicione as credenciais
const client = new MercadoPagoConfig({ accessToken: 'TEST-2453313229452572-092911-e2a5b87ac71ba0c577c887a3ee599639-1160953381', options: {integratorId: 'dev_24c65fb163bf11ea96500242ac130004'} });

const preference = new Preference(client);

const payer = {
    name: 'Lalo',
    surname: 'Landa',
    email: 'test_user_33467020@testuser.com',
    phone: {
        area_code: '41',
        number: '99668-2499'
    },
    address: {
        zip_code: '82540115',
        street_name: 'Rua Falsa',
        street_number: 123
    }
}

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    console.log('aaaa');
    res.render('home');
});

app.get('/payment_successful', function (req, res) {
    console.log(6, req.query);
    res.render('payment_successful', req.query);
});
app.get('/payment_pending', function (req, res) {
    console.log(7, req.query);
    res.render('payment_pending', req.query);
});
app.get('/payment_error', function (req, res) {
    console.log(8, req.query);
    res.render('payment_error', req.query);
});

app.get('/modal', function (req, res) {
    res.render('modal', req.query);
});

app.get('/detail', async function (req, res) {
    console.log(req.query);
    await preference.create({
        body: {
            items: [
                {
                    id: `${Math.floor(Math.random() * 9999 + 1000)}`,
                    title: req.query.title,
                    description: 'Dispositivo de loja de comércio eletrônico móvel',
                    picture_url: `https://eduardoparolin-mp-commerce-nod-37790299e5e6.herokuapp.com/assets/${req.query.img.split('/')[2]}`,
                    unit_price: Number(req.query.price),
                    quantity: 1,
                    currency_id: 'BRL'
                }
            ],
            payer: payer,
            external_reference: 'test_user_33467020@testuser.com',
            payment_methods: {
                installments: 6,
                excluded_payment_methods: [{id: 'visa'}]
            },
            back_urls: {
                success: 'https://eduardoparolin-mp-commerce-nod-37790299e5e6.herokuapp.com/payment_successful',
                pending: 'https://eduardoparolin-mp-commerce-nod-37790299e5e6.herokuapp.com/payment_pending',
                failure: 'https://eduardoparolin-mp-commerce-nod-37790299e5e6.herokuapp.com/payment_error',
            }
        }
    }).then((data) => {
        console.log(1, data);
        req.query.init_point = data.init_point;
    }).catch((error) => {
        console.log(2, error);
    });
    res.render('detail', req.query);
});

app.listen(port);