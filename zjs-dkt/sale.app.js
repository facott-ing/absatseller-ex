module.exports = function(app){

    app.get('/dktsale', income, pralfinds, function(req, res){
        Sale.find({}, {}, {sort:{date:-1}}, function(err, sales){
            res.render('desktop/pral-sales', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, sales:sales});
        });

    });

    app.get('/v-dktsale/:sale', income, pralfinds, function(req, res){
        res.render('desktop/view-sale', {user:req.user, cmessages:req.cmessages, messages:req.messages, csales:req.csales, sale:req.sale});
    });

    app.get('/up-dktsale/:sale', income, function(req, res){
        Sale.update(
            {_id:req.sale.id},
            {status:2},
            function(err){
                res.redirect('/v-dktsale/'+req.sale.id);
            }
        );
    });

    app.get('/p-dktsale/:sale', income, function(req, res){
        res.render('desktop/print-sale', {sale:req.sale});
    });




    // Parameters search
    app.param('sale', function(req, res, next, id){
        Sale.findOne({_id:id}, function(err, sale){
            req.sale = sale;
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