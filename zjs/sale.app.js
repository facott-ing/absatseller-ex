var moment = require('moment-timezone');

module.exports = function(app){
    // render new sale page
    app.get('/mbsale-new/:appointment', income, function(req, res){
        res.render('mobile/new-sale', {headmenu:true, appointment:req.appointment})
    });

    // register new sale
    app.post('/mbsale-new/:appointment', income, function(req, res){
        var b = req.body;
        var d = moment.tz('America/Bogota').format();
        var sale = new Sale({
            client: req.appointment.client,
            seller: req.appointment.seller,
            products: [{
                product: null
            }],
            comments: [{
                comment: b.description
            }],
            date: d,
            price: b.price,
            status: 1
        });
        sale.save(function(err, sale){
            res.redirect('/v-mbsale/'+sale.id);
        });
    });

    // render view sale page
    app.get('/v-mbsale/:sale', income, function(req, res){
        res.render('mobile/view-sale', {headmenu:true, sale:req.sale});
    });

    //render principal sale page
    app.get('/mbsale', income, function(req, res){
        Sale.count({'seller.username':req.user.username, 'seller.pass':req.user.pass}, function(err, count){
            if(count < 1){
                res.render('mobile/pral-sale', {headmenu:true, count:count});
            }else{
                Sale.find({'seller.username':req.user.username, 'seller.pass':req.user.pass}, function(err, sales){
                    res.render('mobile/pral-sale', {headmenu:true, count:count, sales:sales});
                });
            }
        });
    });


    // Income sales principal page

    app.get('/mbiom', income, function(req, res){
        Sale.count({'seller.username':req.user.username, 'seller.pass':req.user.pass}, function(err, count) {
            if (count < 1) {
                res.render('mobile/pral-income', {headmenu: true, count:count});
            }else {
                Sale.find({'seller.username':req.user.username, 'seller.pass':req.user.pass}, function(err, sales){
                    res.render('mobile/pral-income', {headmenu: true, count:count, sales:sales});
                });
            }
        });
    });



    // Parameters search
    app.param('appointment', function(req, res, next, id){
        Appointment.findOne({_id:id}, function(err, appointment){
            req.appointment = appointment;
            next();
        });
    });
    app.param('sale', function(req, res, next, id){
        Sale.findOne({_id:id}, function(err, sale){
            req.sale = sale;
            next();
        });
    });
    app.param('client', function(req, res, next, id){
        Client.findOne({_id:id}, function(err, client){
            req.client = client;
            next();
        });
    });

    // detect if seller is income
    function income(req, res, next){
        if(req.isAuthenticated('Seller')){
            return next();
        }
        res.redirect('/detect');
    }

}