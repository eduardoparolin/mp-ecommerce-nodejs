var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000

var app = express();

const {MercadoPagoConfig, Preference} = require('MercadoPago');
const {Identification, Address} = require("mercadopago/dist/clients/commonTypes");
const {Phone} = require("mercadopago/dist/clients/preference/commonTypes");
// Adicione as credenciais
const client = new MercadoPagoConfig({ accessToken: 'TEST-2453313229452572-092911-e2a5b87ac71ba0c577c887a3ee599639-1160953381', options: {integratorId: 'dev_24c65fb163bf11ea96500242ac130004'} });

const preference = new Preference(client);



const payer = {
// ★ Nome e sobrenome: Lalo Landa
// ★ Email: test_user_33467020@testuser.com (para este exercício, você deve usar este email)
// ★ Telefone: (insira um número de telefone válido em seu país. Ex: 11 12345-6789)
// ★ Endereço: Rua Falsa 123
// ★ CEP: (Insira um CEP do seu país)
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
    res.render('home');
});

app.get('/payment_successful', function (req, res) {
    console.log(6, req.query);
    // {
    //     collection_id: '12345',
    //      collection_status: 'approved',
    //     external_reference: 'ref',
    //     payment_type: 'credit_card',
    //     preference_id: 'preferenceid',
    //     site_id: 'site_id',
    //     processing_mode: 'aggregator',
    //     merchant_account_id: 'null'
    // }
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