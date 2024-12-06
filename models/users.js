const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    age: Number
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;