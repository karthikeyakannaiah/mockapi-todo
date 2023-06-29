const {Schema, model} = require("mongoose");

const todo = new Schema({
    name: String,
    description: String,
    meta: {
        firstkey: String,
        secondKey: String,
        createdAt: {type: Date, default: new Date(Date.now()).toISOString()},
        lastModified: {type: Date}
    }
})

const Todo = model("Todo", todo);
module.exports = Todo