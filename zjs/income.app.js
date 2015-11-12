var numeral = require('numeral');
var moment = require('moment-timezone');

module.exports = function(app){

    app.post('/clatincome', income, function(req, res){
        var b = req.body;
        res.redirect('/rst?a='+b.total+'&b='+ b.inicial+'&c='+ b.cuotas);
    });

    // calculator sale
    app.get('/rst', income, function(req, res){
        var precioVenta = parseInt(req.query.a);
        var inicial = parseInt(req.query.b);
        var cuotas = parseInt(req.query.c);

        var totalVenta = precioVenta / 1.16;
        var iva = totalVenta * 0.16;
        var valorFinanciar = precioVenta - inicial;

        var cuotasMensuales = 0;
        switch(cuotas){
            case 6:
                cuotasMensuales = (valorFinanciar / 6);
                break;
            case 11:
                cuotasMensuales = (valorFinanciar * 0.1)
                break;
            case 20:
                cuotasMensuales = (valorFinanciar * 0.06);
                break;
        }

        var incomeObj = new Object({
            precioVenta:numeral(precioVenta).format(),
            inicial:numeral(inicial).format(),
            cuotas:cuotas,
            totalVenta:numeral(totalVenta).format(),
            valorFinan:numeral(valorFinanciar).format(),
            cuotaMen:numeral(cuotasMensuales).format()
        });

        res.render('mobile/rst-income', {headmenu:true, results:incomeObj});
    });

    //render income page
    app.get('/mbincl', income, function(req, res){
        Sale.find({'seller._id':req.user._id}, {}, {sort:{date:1}}, function(err, sales){
            var totalincome = 0;
            var monthlyincome = 0;
            var d = moment.tz('America/Bogota').format();
            var dx = parseInt(d.substring(0, 7).replace('-', ''));

            for(var i in sales){
                var saled = sales[i].date.toISOString();
                saled = parseInt(saled.substring(0, 7).replace('-', ''));

                totalincome = totalincome + sales[i].price;

                if(saled === dx) monthlyincome = monthlyincome + sales[i].price;
            }

            res.render('mobile/my-incomes', {headmenu:true, totalincome:numeral(totalincome).format(), monthlyincome:numeral(monthlyincome).format()});


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