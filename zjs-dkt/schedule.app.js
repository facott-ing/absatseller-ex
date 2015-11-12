module.exports = function(app){

    app.get('/dktschedule', income, pralfinds, function(req, res){
        Appointment.find({}, {}, {sort:{Date:-1}}, function(err, appointments){
            res.render('desktop/pral-appointment', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, schedules:appointments})
        });
    });

    app.get('/v-dktschedule/:schedule', income, pralfinds, function(req, res){
        res.render('desktop/view-schedule', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, schedule:req.appointment});
    });

    app.post('/n-dktschedule', income, function(req, res){
        var b = req.body;

        Client.findOne({_id: b.client}, function(err, client){
            Seller.findOne({_id: b.seller}, function(err, seller){
                var appo = new Appointment({
                    client: client,
                    seller: seller,
                    Date: b.datec,
                    oppointmentStar: b.hour,
                    comments:[{
                        comment: b.descrip
                    }],
                    status: 1,
                    sale: null
                });

                appo.save(function(err, appoint){
                    res.redirect('/v-dktschedule/'+appoint.id);
                });
            });
        });
    });



    // Parameters search
    app.param('schedule', function(req, res, next, id){
        Appointment.findOne({_id:id}, function(err, a){
            req.appointment = a;
            next();
        });
    });


    //principal finds parameters
    function pralfinds(req, res, next){
        Message.count({'to.seller':req.user._id, 'to.readstate':1}, function(err, cmessages){
            Message.find({'to.seller':req.user._id, 'to.readstate':1}, {}, {sort:{Date:1}}, function(err, messages){
                Sale.count({status:1}, function(err, csales){
                    req.cmessages = cmessages;
                    req.messages = messages;
                    req.csales = csales;

                    return next();
                });
            });
        });
    }


    // detect if seller is income
    function income(req, res, next){
        if(req.isAuthenticated('User')){
            return next();
        }
        res.redirect('/desktop');
    }
}