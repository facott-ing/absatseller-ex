var passport = require('passport')

module.exports = function(app){

    // authentication interface
    app.get('/mobile', function(req, res){
        if(req.isAuthenticated('Seller')){
            res.redirect('/mblprofile');
        }else{
            res.render('mobile/authentication');
        }

    });


    // authentication POST interface
    app.post('/authentication',
        passport.authenticate('Seller', { successRedirect: '/mblprofile',
            failureRedirect: '/mobile',
            failureFlash: false })
    );

    app.get('/mblprofile', income, function(req, res){
        Message.count({'to.seller':req.user._id, 'to.readstate':1}, function(err, countmsgs){
            Appointment.count({'seller._id':req.user._id, status:1}, function(err, countappo){
                res.render('mobile/index', {headmenu:false, countmsgs:countmsgs, countappo:countappo, user:req.user});
            });
        });
    });

    // detect if seller is income
    function income(req, res, next){
        if(req.isAuthenticated('Seller')){
            return next();
        }
        res.redirect('/detect');
    }

    // log out
    app.get('/mblout', function(req, res){
        req.logOut();
        res.redirect('/mobile')
    });

}