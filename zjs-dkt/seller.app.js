var moment = require('moment-timezone');
var encryp = require('MD5');
var fs = require('fs-extra');

var co_packfull = require('./rjson/colombia_json.json');
var  co_pack = Object.keys(co_packfull);


module.exports = function(app){
    // principal sellers page
    app.get('/dktsellers', income, pralfinds, function(req, res){
        Seller.count({}, function(err, cseller){
            Seller.find({}, {}, {sort: {name:1}}, function(err, sellers){
                res.render('desktop/pral-sellers', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, cseller:cseller, sellers:sellers, co_pack:co_pack});
            });
        });
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

    //register seller
    app.post('/n-dktsellers', income, function(req, res){
        var b = req.body;

        Seller.findOne({'contact.email': b.email}, function(err, seller){
            if(seller){
                // si el vendedor existe envielo a la pagina de error
            }else{

                var pass = encryp('12345');
                var nseller = new Seller({
                    name: b.name,
                    username: b.email,
                    pass: pass,
                    contact: {
                        phoneNumber: b.phonenum,
                        email: b.email
                    },
                    address: {
                        street: b.address,
                        city: b.city,
                        state: b.state,
                        zipCode: '',
                        country: 'Colombia'
                    },
                    status: 1
                });

                nseller.save(function(err, nseller){
                    if(err) console.log(err)
                    avatar(nseller.id);
                    res.redirect('/dktsellers')
                });
            }
        });
    });


    // view sellers
    app.get('/v-dktseller/:seller', income, pralfinds, function(req, res){
        Sale.count({'seller._id':req.seller._id}, function(err, csesales){
            Sale.find({'seller._id':req.seller._id}, {}, {sort: {date:1}}, function(err, sesales){
                Appointment.count({'seller._id':req.seller._id}, function(err, cappoint){
                    res.render('desktop/view-seller', {seller:req.seller, csesales:csesales, sesales:sesales, cappoint:cappoint ,user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales});
                });
            });
        });
    });


    // Parameters search
    app.param('seller', function(req, res, next, id){
        Seller.findOne({_id:id}, function(err, seller){
            req.seller = seller;
            next();
        });
    });


    //create seller avatar
    function avatar(id){
        var avatar_ini = './public/images/avatar.jpg'
        var avatar_des = './public/images/uploads/people/'+id+'.jpg'
        fs.copy(avatar_ini, avatar_des, function(err){
            if(err) console.log(err)
            return
        });
    }

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