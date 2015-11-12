var fs = require('fs-extra');
var encryp = require('MD5');
var lwip = require('lwip');
var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();

module.exports = function(app){
    //render principal user page
    app.get('/mbuser', income, function(req, res){
        var avatar = fs.existsSync('./public/images/uploads/people/'+req.user.id+'.jpg')
        res.render('mobile/pral-user', {headmenu:true, user:req.user, avatar:avatar});
    });

    app.post('/uploader', income, multipartMiddleware, function(req, res){
        var b = req.body
        var tmp_p = req.files.avatar.path;
        var des_p = './public/images/uploads/people/' +req.user.id+'.jpg';
        var destmp_p = './public/images/uploads/temp/' +req.user.id+'.jpg';

        fs.rename(tmp_p, destmp_p, function(err){
            if(err) console.log(err)
            fs.unlink(tmp_p, function(){
                if(err) console.log(err);
                lwip.open(destmp_p, function(err, image){
                    if(err) console.log(err)
                    image.batch()
                        .resize(320, 380, 'lanczos')
                        .scale(0.6)
                        //.crop(400, 400)
                        .writeFile(des_p, function(err){
                            if (err) return console.log(err);
                            fs.unlink(destmp_p, function(){
                                if (err) throw err;
                                res.redirect('/mbuser')
                            })

                        })
                });
            });
        });
    });

    app.get('/mbpass', income, function(req, res){
        res.render('mobile/pral-pass', {headmenu:true, user:req.user});
    });

    app.post('/mbpass', income, function(req, res){
        var b = req.body;
        var pass = encryp(b.pass);
        console.log(pass);

        Seller.update(
            {_id:req.user._id},
            {
                pass:pass
            },
            function(err){
                res.redirect('/mblout');
            }
        );
    });



    // detect if seller is income
    function income(req, res, next){
        if(req.isAuthenticated('Seller')){
            return next();
        }
        res.redirect('/detect');
    }

}