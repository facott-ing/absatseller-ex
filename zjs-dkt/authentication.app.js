var passport = require('passport');
var moment = require('moment-timezone');
var numeral = require('numeral');

module.exports = function(app){

    // authentication interface
    app.get('/desktop', function(req, res){
        if(req.isAuthenticated('User')){
            res.redirect('/dktprofile');
        }else{
            res.render('desktop/authentication');
        }

    });

    // authentication post interface
    app.post('/dktauthen',
        passport.authenticate('User', { successRedirect: '/dktprofile',
            failureRedirect: '/desktop',
            failureFlash: false })
    );

    // render desktop profile interface
    app.get('/dktprofile', income, function(req, res){

        // users count
        User.count({}, function(err, cusers){
            Seller.count({}, function(err, csellers){
                Client.count({}, function(err, cclients){
                    Message.count({'to.seller':req.user._id, 'to.readstate':1}, function(err, cmessages){
                        Message.find({'to.seller':req.user._id, 'to.readstate':1}, {}, {sort:{Date:1}}, function(err, messages){
                            var date = moment.tz('America/Bogota').format();
                            date = date.substring(0, 11);
                            var gte = date+'00:00:00Z';
                            Appointment.count({Date:gte}, function(err, cappointment){
                                Appointment.find({Date:gte}, {}, {oppointmentStar:1}, function(err, appointments){
                                    Sale.count({status:1}, function(err, csales){
                                        Sale.find({status:1}, {}, {sort: {date:-1}, limit:3}, function(err, sales){
                                            Sale.find({}, function(err, tsales){
                                                var income = 0;
                                                for(var i in tsales){
                                                    income = income + tsales[i].price
                                                }
                                                res.render('desktop/index', {user:req.user, cusers:cusers-1, csellers:csellers, cclients:cclients, cmessages:cmessages, messages:messages, cappointments:cappointment, appointments:appointments, csales:csales, sales:sales, income:numeral(income).format()});
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    });


    // detect if seller is income
    function income(req, res, next){
        if(req.isAuthenticated('User')){
            return next();
        }
        res.redirect('/desktop');
    }

    // log out
    app.get('/dktout', function(req, res){
        req.logOut();
        res.redirect('/desktop')
    });
}