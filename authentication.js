
var LocalEstrategy=require('passport-local').Strategy;
var encryp = require('MD5');

module.exports = function(passport){

    // authentication sellers
    passport.use('Seller', new LocalEstrategy(
        {
            usernameField: 'username',
            passwordField: 'pass'
        },
        function(username, pass, done) {
            Seller.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Nombre de usuario incorrecto' });
                }
                var pm = encryp(pass)
                if (user.pass !== pm) {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }
                return done(null, user);
            });
        }
    ));

    // authentication users
    passport.use('User', new LocalEstrategy(
        {
            usernameField: 'username',
            passwordField: 'pass'
        },
        function(username, pass, done) {
            User.findOne({ username: username }, function (err, user) {

                if (err) { return done(err); }
                if (!user) {
                    console.log('entro por que no encontro el usuario')
                    return done(null, false, { message: 'Nombre de usuario incorrecto' });
                }
                var pm = encryp(pass)
                if (user.pass !== pm) {
                    console.log('entro por donde la contraseña es incorrecta')
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }

                return done(null, user);
            });
        }
    ));

// SERIALIZE SELLER AUTHENTICATION
// --------------------- + --------------------------------------------------
// --------------------- + -------------------------------------------
// --------------------- + -------------------------------
// --------------------- + ---------------------

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Seller.findById(id, function(err, user) {
            if(user === null){
                User.findById(id, function(err, user){
                    done(err, user)
                });
            }else{
                done(err, user);
            }
        });
    });


// --------------------- + ---------------------
// --------------------- + -------------------------------
// --------------------- + -------------------------------------------
// --------------------- + --------------------------------------------------



}


