

module.exports = function(app){

    app.get('/dkttipes', income, pralfinds, function(req, res){
        Typepro.count({}, function(err, ctipes){
            Typepro.find({}, {}, {sort:{name:1}}, function(err, tipes){
                res.render('desktop/pral-pdtstypes', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, tipes:tipes});
            });
        });
    });



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