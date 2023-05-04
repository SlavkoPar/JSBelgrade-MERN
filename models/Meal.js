const mongoose = require('mongoose');
const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId, Array } = Schema.Types;

let mealSchema = new Schema({
    wsId: {
        type: ObjectId, required: true, index: { unique: false }
    },
    title: {
        type: String,
        required: true,
        index: { unique: false }
    },
    level: {
        type: Number,
        required: true
    },
    parentMenu: {
        type: ObjectId,
        index: { unique: false }
    },
	source: 0,
	status: 0,
    created: {
        type: DateBy,
        required: true
    },
    modified: {
        type: DateBy
    }
}, {
    collection: 'meals'
})

mealSchema.index({ wsId: 1, title: 1 }, { unique: true } );
mealSchema.index({ title: "text" }); 

module.exports = mongoose.model('Question', mealSchema)
