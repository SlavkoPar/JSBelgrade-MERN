const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

let userSchema = new Schema({
    wsId: {
        type: ObjectId, required: true, index: { unique: false }
    },
    userName: { type: String, required: true, index: { unique: false } },
    email: {    type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    superUser: { type: Boolean, required: true },
    parentGroup: {
        type: ObjectId,
        // required: true,
        index: { unique: false }
    },
    role: {
        type: String, required: true
    },
    color: {
        type: String
    },
    confirmed: {
        type: Boolean, required: true
    },
    created: {
        type: DateBy,
        required: true
    },
    modified: {
        type: DateBy
    },
}, {
    collection: 'users'
})

userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });


});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.index({ wsId: 1, userName: 1 } ); 

module.exports = mongoose.model('User', userSchema)
