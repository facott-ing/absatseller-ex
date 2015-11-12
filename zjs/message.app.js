var moment = require('moment-timezone');

module.exports = function(app){

    //render principal page
    app.get('/mbme', income, function(req, res){
        Message.count({'to.seller':req.user._id}, function(err, count){
            if(count < 1){
                res.render('mobile/pral-message', {headmenu:true, count:count});
            }else{
                Message.find({'to.seller':req.user._id}, {}, {sort:{datetime:1}}, function(err, messages){
                    var d = moment.tz('America/Bogota').format();
                    res.render('mobile/pral-message', {headmenu:true, count:count, messages:messages, user:req.user, dnow:d});
                });
            }
        });
    });

    //render new message page
    app.get('/n-mbme', income, function(req, res){
        Seller.find({}, {}, {sort: {name:1}}, function(err, sellers){
            res.render('mobile/new-message', {headmenu:true, sellers:sellers});
        });
    });

    // render mensage sends
    app.get('/mbme-s', income, function(req, res){
        Message.count({'from._id':req.user._id}, function(err, count){
            if(count < 1){
                res.render('mobile/pral-message-send',{headmenu:true, count:count});
            }else{
                Message.find({'from._id':req.user._id}, {}, {sort: {datetime:1}}, function(err, msgsout){
                    res.render('mobile/pral-message-send',{headmenu:true, count:count, messages:msgsout});
                });
            }
        });
    });

    //render view message send
    app.get('/vs-mbme/:message', income, function(req, res){
        var to = req.message.to;
        var to = to.map(function(i){ return i.seller});
        Seller.find({_id: {$in:to}}, {username:1}, function(err, senders){
            res.render('mobile/view-message-send', {headmenu:true, message:req.message, senders:senders});
        });
    });


    // open message inbox
    app.get('/v-mbme/:message', income, function(req, res){
        var senders = req.message.to
        for(var i in senders){
            if(senders[i].seller === req.user.id){
                senders[i].readstate = 2;
            }
        }
        Message.update(
            {
                _id:req.message.id
            },
            {
                to:senders
            },
            function(err){
                res.render('mobile/view-message', {headmenu:true, message:req.message, user:req.user});
            }
        );

    });


    // register message
    app.post('/n-mbme', income, function(req, res){
        var b = req.body;
        var senders = b.senders.split(',');
        var sendersObj = [];
        // mensage status: 1->unread, 2->read
        for(var i in senders){
            var sender = new Object({
                seller: senders[i],
                readstate: 1
            });
            sendersObj.push(sender);
        }

        var d = moment.tz('America/Bogota').format();
        var msg = new Message({
            from:req.user,
            subject: b.subject,
            datetime: d,
            to:sendersObj,
            messages:[{
                message: b.message,
                date:d,
                username:req.user.username
            }]
        });

        msg.save(function(err){
            res.redirect('/mbme');
        });

    });

    // load ajax comment message
    app.post('/n-msg/:message', income, function(req, res){
        var b = req.body;
        var d = moment.tz('America/Bogota').format();
        var comment = new Object({
            message:b.comment,
            date:d,
            username:req.user.username
        });

        Message.update(
            {_id:req.message.id},
            {$push: {'messages':comment}},
            function(err){
                res.send(true);
            }
        );
    });

    // load ajax index page count
    app.post('/jx-messages', income, function(req, res){
        Message.count({'to.seller':req.user._id, 'to.readstate':1}, function(err, countmsgs){
            var e='<span>'+countmsgs+'</span>'
            res.send(e);
        });
    });


    // Parameters search
    app.param('client', function(req, res, next, id){
        Client.findOne({_id:id}, function(err, client){
            req.client = client;
            next();
        });
    });
    app.param('message', function(req, res, next, id){
        Message.findOne({_id:id}, function(err, message){
            req.message = message;
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