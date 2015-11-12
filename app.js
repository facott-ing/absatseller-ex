var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

// --------------------- + --------------------------------------------------
// Absat-app Module requires

var port = process.env.PORT || 1111;
var mongoose = require('mongoose');
var fs = require('fs-extra');
var mobileDetect = require('mobile-detect');
var passport = require('passport');
var LocalEstrategy=require('passport-local').Strategy;
var flash = require('connect-flash');
var session = require('express-session')
// --------------------- + --------------------------------------------------

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.set('port', process.env.PORT || 1111);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('5710836184a9a13869787cccb77b5788'));
app.use(express.static(path.join(__dirname, 'public')));

// --------------------- + --------------------------------------------------
// Absat-app uses

app.use(session({
    saveUninitialized: true, // saved new sessions
    resave: true,
    secret: '5710836184a9a13869787cccb77b5788',
    cookie : { httpOnly: true, maxAge: 2419200000 }
}));
app.use(passport.initialize());
app.use(passport.session());
// --------------------- + --------------------------------------------------

app.use('/', routes);
app.use('/users', users);

// --------------------- + --------------------------------------------------
// Absat-app outside files requires
require('./mongodbConnection.js');
require('./schemaDB');
require('./authentication')(passport);
// --------------------- + --------------------------------------------------


// MOBILE RESPONSE
// --------------------- + --------------------------------------------------
// --------------------- + -------------------------------------------
// --------------------- + -------------------------------
// --------------------- + ---------------------
// Mobile redirect
app.get('/detect', function(req, res){
    var md = new mobileDetect(req.headers['user-agent']);
    if(md.mobile() === null){
        res.redirect('/desktop');
    }else{
        res.redirect('/mobile');
    }
});

// load authentication module
require('./zjs/authentication.app.js')(app);

// Load Schedule of visits
require('./zjs/schedule.app.js')(app);

// Load Clients of visits
require('./zjs/clientlist.app.js')(app);

// Load sale module
require('./zjs/sale.app.js')(app);

// Load message module
require('./zjs/message.app.js')(app);

// Load income module
require('./zjs/income.app.js')(app);

// Load user module
require('./zjs/user.app.js')(app);



// --------------------- + ---------------------
// --------------------- + -------------------------------
// --------------------- + -------------------------------------------
// --------------------- + --------------------------------------------------



// DESKTOP RESPONSE
// --------------------- + --------------------------------------------------
// --------------------- + -------------------------------------------
// --------------------- + -------------------------------
// --------------------- + ---------------------

// load authentication module
require('./zjs-dkt/authentication.app.js')(app);

// load seller module
require('./zjs-dkt/seller.app.js')(app);

// load message module
require('./zjs-dkt/message.app.js')(app);

// load admin module
require('./zjs-dkt/user.app.js')(app);

// Load client module
require('./zjs-dkt/client.app.js')(app);

// Load appointments module
require('./zjs-dkt/schedule.app.js')(app);

// Load sales module
require('./zjs-dkt/sale.app.js')(app);


// --------------------- + ---------------------
// --------------------- + -------------------------------
// --------------------- + -------------------------------------------
// --------------------- + --------------------------------------------------


/*/ Create server
http.createServer(app).listen(app.get('port'), function(){
    console.log('the app listen on port:' + app.get('port'));
});*/
app.listen(port)