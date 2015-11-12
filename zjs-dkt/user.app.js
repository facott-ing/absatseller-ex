var moment = require('moment-timezone');
var encryp = require('MD5');
var fs = require('fs-extra');

var co_packfull = require('./rjson/colombia_json.json');
var  co_pack = Object.keys(co_packfull);

module.exports = function(app){

    // principal users page
    app.get('/dktusers', income, pralfinds, function(req, res){

        User.count({permissions: { $ne:1 }, _id: {$ne:req.user._id}}, function(err, cusers){

            User.find({permissions: { $ne:1 }, _id: {$ne:req.user._id}}, {pass:0}, {sort: {name:1}}, function(err, users){

                res.render('desktop/pral-users', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, cusers:cusers, users:users, co_pack:co_pack});
            });
        });

    });


    //create users
    app.post('/n-dktusers', income, function(req, res){
        var b = req.body;
        User.findOne({'contact.email': b.email}, function(err, user){
            if(user){
                //envio a la pagina de error
            }else{
                var pass = encryp('12345');
                var nuser = new User({
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
                    permissions: b.type
                });

                nuser.save(function(err, xuser){
                    if(err) res.send(err)
                    avatar(xuser.id);
                    res.redirect('/dktusers');
                });
            }
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