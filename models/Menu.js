const mongoose = require('mongoose');
const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

let menuSchema = new Schema({
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
    created: {
        type: DateBy,
        required: true
    },
    modified: {
        type: DateBy
    }
}, {
    collection: 'menus'
})

//menuSchema.index({ parentMenu: 1 });   // level

menuSchema.index({ wsId: 1, title: 1 }, { unique: true } );
module.exports = mongoose.model('Menu', menuSchema)
