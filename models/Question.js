const mongoose = require('mongoose');
const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId, Array } = Schema.Types;

let questionSchema = new Schema({
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
    questionAnswers: [
        { _id: { type: ObjectId }, assigned: { type: DateBy, required: true } }
    ],
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
    collection: 'questions'
})

questionSchema.index({ wsId: 1, title: 1 }, { unique: true } );
questionSchema.index({ title: "text" }); 

module.exports = mongoose.model('Question', questionSchema)
