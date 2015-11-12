// adsatNetwork System - Mongo data base structure
var mongoose = require('mongoose');


var userSchema = mongoose.Schema({
    name: String,
    username: String,
    pass: String,
    contact: {
        phoneNumber: String,
        email: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    permissions: Number
});
User = mongoose.model('User', userSchema);

var sellerSchema = mongoose.Schema({
    code: String,
    name: String,
    username: String,
    pass: String,
    contact: {
        phoneNumber: String,
        email: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    status: Number
});
Seller = mongoose.model('Seller', sellerSchema);

var clientSchema = mongoose.Schema({
    name: String,
    contact:{
        phonenumbers: [{
            number: String
        }],
        email: String
    },
    addresses:[{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    }],
    seller: String
});
Client = mongoose.model('Client', clientSchema);

var appointmentSchema = mongoose.Schema({
    client: Object,
    seller: Object,
    Date: Date,
    oppointmentStar: String,
    comments:[{
        comment: String
    }],
    status: Number,
    sale: Object
});
Appointment = mongoose.model('Appointment', appointmentSchema);

var productSchema = mongoose.Schema({
    nombre: String,
    types: [{
        type: Object
    }],
    setProduct: Boolean,
    products: [{
        product: Object
    }],
    quantity: Number,
    price: Number,
    Description: String
});
Product = mongoose.model('Product', productSchema);

var typeproSchema = mongoose.Schema({
    name: String
});
Typepro = mongoose.model('Typepro', typeproSchema);

var saleSchema = mongoose.Schema({
    client: Object,
    seller: Object,
    products: [{
        product: Object
    }],
    comments: [{
        comment: String
    }],
    date: Date,
    price: Number,
    status: Number
});
Sale = mongoose.model('Sale', saleSchema);

var messageSchema = mongoose.Schema({
    from:Object,
    subject: String,
    datetime: Date,
    to:[{
        seller: String,
        readstate: Number
    }],
    messages:[{
        message: String,
        date:Date,
        username:String
    }]
});
Message = mongoose.model('Message', messageSchema);

