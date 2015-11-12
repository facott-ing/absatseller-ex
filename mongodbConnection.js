// adsatNetwork System - Mongo data base connection
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/absatseller');

var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));