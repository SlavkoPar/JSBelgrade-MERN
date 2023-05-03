const mongoose = require('mongoose');
const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

let categorySchema = new Schema({
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
    parentCategory: {
        type: ObjectId,
        index: { unique: false }
    },
    created: {
        type: DateBy,
        required: true
    },
    modified: {
        type: DateBy
    }
}, {
    collection: 'categories'
})

//categorySchema.index({ parentCategory: 1 });   // level

categorySchema.index({ wsId: 1, title: 1 }, { unique: true } );
module.exports = mongoose.model('Category', categorySchema)
