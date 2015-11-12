var moment = require('moment-timezone');


module.exports = function(app){
    // response calendar interface
    app.get('/mbsv', income, function(req, res){
        var date = moment.tz('America/Bogota').format();
        date = date.substring(0, 11);
        var gte = date+'00:00:00Z';

        Appointment.count({'seller.username':req.user.username , 'seller.pass':req.user.pass, Date:gte}, function(err, count){
            if(count < 1){
                res.render('mobile/pral-schedule', {headmenu:true, count:count});
            }else{
                Appointment.find({'seller.username':req.user.username , 'seller.pass':req.user.pass, Date:gte}, {}, {sort:{oppointmentStar:1}}, function(err, citas){
                    res.render('mobile/pral-schedule', {headmenu:true, count:count, citas:citas});
                });
            }

        });

    });

    app.get('/mbsv-t', income, function(req, res){
        Appointment.count({'seller.username':req.user.username , 'seller.pass':req.user.pass}, function(err, count){
            if(count < 1){
                res.render('mobile/pral-schedule-todas', {headmenu:true, count:count});
            }else{
                var d = moment.tz('America/Bogota').format();
                Appointment.find({'seller.username':req.user.username , 'seller.pass':req.user.pass}, {}, {sort:{Date:-1, oppointmentStar:-1}}, function(err, citas){
                    res.render('mobile/pral-schedule-todas', {headmenu:true, count:count, citas:citas, datenow:d});
                });
            }

        });

    });

    // view appointment page
    app.get('/v-mbsv/:appointment', income, function(req, res){
        var d = moment.tz('America/Bogota').format();
        res.render('mobile/view-schedule', {headmenu:true, appointment:req.appointment, datenow:d});
    });

    // create appointment page
    app.get('/n-mbsv/:client', income, function(req, res){
        res.render('mobile/new-schedule', {headmenu:true, client:req.client})
    });

    app.post('/mbsv-new/:client', income, function(req, res){
        var b = req.body;

        var appointment  =new Appointment({
            client: req.client,
            seller: req.user,
            Date: b.datec,
            oppointmentStar: b.timec,
            comments:[{
                comment: b.description
            }],
            status: 1,
            sale: null
        });
        appointment.save(function(err, appointment){
            if(err) res.redirect('/n-mbsv?e=1/'+req.client.id);
            res.redirect('/v-mbsv/'+appointment.id);
        });
    });

    // Check appointment asist
    app.get('/asisti/:appointment', income, function(req, res){
        Appointment.update(
            {_id:req.appointment.id},
            {status:2},
            function(err){
                res.redirect('/v-mbsv/'+req.appointment.id);
            }
        );

    });

    // load appointment count
    app.post('/ld-appo', income, function(req, res){
        Appointment.count({'seller.username':req.user.username , 'seller.pass':req.user.pass, status:1}, function(err, count){
            var e='<span>'+count+'</span>'
            res.send(e)
        });
    });



    // Parameters search
    app.param('appointment', function(req, res, next, id){
        Appointment.findOne({_id:id}, function(err, appointment){
            req.appointment = appointment;
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