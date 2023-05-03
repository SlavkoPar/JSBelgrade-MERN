const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const DateBy = new Schema({
    date: {
        type: Date, required: true
    },
	by: {
        userId: {
            type: ObjectId
            // When we create Groups, by group-seeds.js, we don't have Users
            // required: true,
            // ref: 'User' 
        },
        userName: {
            type: String
        }
    }
})
