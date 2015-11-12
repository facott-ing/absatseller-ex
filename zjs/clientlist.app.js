
var co_packfull = require('./rjson/colombia_json.json');

var  co_pack = Object.keys(co_packfull);

module.exports = function(app){

    // RENDER PRINCIPAL CLIENT PAGE
    app.get('/mbcl',income, function(req, res){
        Client.count({seller:req.user.id}, function(err, count){
            if(count > 0){
                Client.find({seller:req.user.id}, {}, {sort : {name : 1}}, function(err, clients){
                    res.render('mobile/pral-clients', {headmenu:true, count:count, clients:clients})
                });
            }else{
                res.render('mobile/pral-clients', {headmenu:true, count:count});
            }
        });
    });

    // RENDER NEW CLIENT PAGE
    app.get('/n-mbcl', income, function(req, res){
        res.render('mobile/new-clients', {headmenu:true, co_pack:co_pack, user:req.user, e:req.query.e});
    });

    // LOAD CITIES
    app.post('/cities', income, function(req, res){
        var b = req.body;
        var state = b.state;
        var cities = co_packfull[state];
        var response='';
        for(var i=0 in cities){
            var e = '<option value="'+ cities[i] +'">'+ cities[i] +'</option>'
            response = response + e;
        }
        res.send(response);
    });


    // CREATE NEW CLIENT
    app.post('/mbcl-new', income, function(req, res){
        var b = req.body

        Client.findOne({name: b.name}, function(err, client){
            if(err){
                var type = encodeURIComponent('1')
                res.redirect('/n-mbcl?e='+type);
            }
            if(client){
                res.redirect('/n-mbcl?e=2');
            }else{
                var clnt = new Client({
                    name: b.name,
                    contact:{
                        phonenumbers: [{
                            number: b.phone
                        }],
                        email: b.email
                    },
                    addresses:[{
                        street: b.address,
                        city: b.city,
                        state: b.state,
                        zipCode: '+57',
                        country: b.country
                    }],
                    seller: b.seller
                });

                clnt.save(function(err, client){
                    if(err) res.redirect('/n-mbcl?e=1');
                    res.redirect('/mbcl');
                });
            }
        });
    });

    //VIEW CLIENT PAGE
    app.get('/v-mbcl/:client', income, function(req, res){
        res.render('mobile/view-clients', {headmenu:true, client:req.client});
    });


    // Parameters search
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