const mongoose = require('mongoose');
const DateBy = require('./DateBy')

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

let todoSchema = new Schema({
    wsId: {
        type: ObjectId, required: true, index: { unique: false }
    },  
    title: {
        type: String,
        required: true,
        index: { unique: false }
    },
    parentTodo: {
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
    collection: 'todos'
})

//todoSchema.index({ parentTodo: 1 });   // level

todoSchema.index({ wsId: 1, title: 1 }, { unique: true } );
module.exports = mongoose.model('Todo', todoSchema)
