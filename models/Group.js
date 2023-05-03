const mongoose = require('mongoose');
const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

let groupSchema = new Schema({
    groupName: {
        type: String,
        required: true,
        index: { unique: true }
    },
    level: {
        type: Number,
        required: true
    },
    parentGroup: {
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
    collection: 'groups'
})

//groupSchema.index({ parentGroup: 1 });   // level

module.exports = mongoose.model('Group', groupSchema)
