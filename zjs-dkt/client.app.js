var co_packfull = require('./rjson/colombia_json.json');
var  co_pack = Object.keys(co_packfull);

module.exports = function(app){
    // pral client pages
    app.get('/dktclient', income, pralfinds, function(req, res){
        Client.count({}, function(err, cclients){
            Client.find({}, {}, {sort: {name:1}}, function(err, clients){
                res.render('desktop/pral-clients', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, co_pack:co_pack, cclients:cclients, clients:clients});
            });
        });
    });
    // insert client
    app.post('/n-dktclient', income, function(req,res){
        var b = req.body;

        Client.findOne({name: b.name, city: b.city}, function(err, clexist){
            if(clexist){
                // el cliente existe envio a la pagina de error
            }else{
                var ncli = new Client({
                    name: b.name,
                    contact:{
                        phonenumbers: [{
                            number: b.phonenum
                        }],
                        email: b.email
                    },
                    addresses:[{
                        street: b.address,
                        city: b.city,
                        state: b.state,
                        zipCode: null,
                        country: 'Colombia'
                    }],
                    seller: null
                });

                ncli.save(function(err, client){
                    if(err) console.log(err)
                    res.redirect('/v-dktclient/'+client.id);
                });
            }
        });
    });

    //view client
    app.get('/v-dktclient/:client', income, pralfinds, function(req, res){
        Sale.count({'client._id':req.client._id}, function(err, cclient){
            Sale.find({'client._id':req.client._id}, {}, {sort:{date:1}}, function(err, sales){
                if(req.client.seller != null){
                    Seller.findOne({_id:req.client.seller}, function(err, seller){
                        res.render('desktop/view-client', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, client:req.client, clsales:sales, seller:seller});
                    });
                }else{
                    Seller.find({status:1}, {}, {sort:{name:1}}, function(err, sellers){
                        res.render('desktop/view-client', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, client:req.client, clsales:sales, sellers:sellers});
                    });


                }
            });
        });
    });



    // parameters client
    app.param('client', function(req, res, next, id){
        Client.findOne({_id:id}, function(err, client){
            req.client = client;
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