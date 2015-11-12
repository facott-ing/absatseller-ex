var moment = require('moment-timezone');

module.exports = function(app){
    // principal messages
    app.get('/dktmessages', income, pralfinds, function(req, res){
        Message.count({'to.seller':req.user._id}, function(err, cntmsg){
            res.render('desktop/pral-messages', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, cntmsg:cntmsg});
        });

    });

    // send messages
    app.get('/dktsmessages', income, pralfinds, function(req, res){
        Message.count({'from._id': req.user._id}, function(err, csendme){
            Message.find({'from._id': req.user._id}, {}, {sort: {datetime:1}}, function(err, sendme){
                res.render('desktop/send-messages', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, csendme:csendme, sendme:sendme})
            });
        });
    });


    // view messages
    app.get('/v-dktsellers/:message', income, pralfinds, function(req, res){
        // detect if message is to me and change readstate
        if(req.message.from._id != req.user._id){
            var tolist = req.message.to
            for(var i in tolist){
                if(tolist[i].seller === req.user.id){
                    tolist[i].readstate = 2;
                }
            }
            Message.update(
                {_id:req.message.id},
                {
                    to:tolist
                },
                function(err){
                    if(err) res.send(err);
                }
            );
        }


        var ids = req.message.to;
        ids = ids.map(function(i){ return(i.seller)});
        Seller.find({_id : {$in : ids}}, {name:1}, function(err, to){
            User.find({_id : {$in : ids}}, {name:1}, function(err, us){
                var list = [];
                list = list.concat(to);
                list = list.concat(us);
                res.render('desktop/view-message', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, message:req.message, list:list});
            });
        });
    });


    // load users request
    app.post('/dktlusers', function(req, res){
        var b = req.body;
        var regex = new RegExp(b.canon, 'i');
        var query = {name:regex};

        Seller.find(query, {name:1}, {sort:{name:1}}, function(err, sellers){
            User.find(query, {name:1, username:1}, {sort:{name:1}}, function(err, users){

                var items = '';

                for(var i in sellers){
                    var item = '<li class="list-group-item"><a onclick="selectedto(this)", id="'+sellers[i].id+'" rev="'+sellers[i].name+'"><img src="/images/uploads/people/'+sellers[i].id+'.jpg"><span class="text-primary">'+sellers[i].name+'</span></a></li>';
                    items = items +item;
                }

                for(var j in users){
                    if(users[j].username != 'admin'){
                        var item = '<li class="list-group-item"><a onclick="selectedto(this)", id="'+users[j].id+'" rev="'+users[j].name+'"><img src="/images/uploads/people/'+users[j].id+'.jpg"><span class="text-primary">'+users[j].name+'</span></a></li>';
                        items = items +item;
                    }
                }
                res.send(items);
            });
        });
    });


    // create message
    app.post('/n-dktmessage', income, function(req, res){
        var b = req.body;
        var d = moment.tz('America/Bogota').format();

        if(b.toall === 'on'){
            Seller.find({}, {_id:1}, function(err, sellers){
                var sls = [];
                for(var i in sellers){
                    var obj = new Object({
                        seller:sellers[i].id,
                        readstate: 1
                    });
                    sls.push(obj);
                }
                var msg = new Message({
                    from:req.user,
                    subject: b.subject,
                    datetime: d,
                    to:sls,
                    messages:[{
                        message: b.message,
                        date: d,
                        username: req.user.username
                    }]
                });

                msg.save(function(err){
                    res.redirect('/dktmessages');
                });
            });

        }else{
            var para = b.para.split(',');
            var to = [];
            for(var i in para){
                var obj = new Object({
                    seller:para[i],
                    readstate: 1
                });
                to.push(obj);
            }
            var msg = new Message({
                from:req.user,
                subject: b.subject,
                datetime: d,
                to:to,
                messages:[{
                    message: b.message,
                    date: d,
                    username: req.user.username
                }]
            });

            msg.save(function(err){
                res.redirect('/dktmessages');
            });

        }




    });


    // parameters message
    app.param('message', function(req, res, next, id){
        Message.findOne({_id:id}, function(err, message){
            req.message = message;
            next();
        });
    });


    //principal finds parameters
    function pralfinds(req, res, next){
        Message.count({'to.seller':req.user._id, 'to.readstate':1}, function(err, cmessages){
            Message.find({'to.seller':req.user._id}, {}, {sort:{datetime:1}}, function(err, messages){
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