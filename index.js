require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Todo = require("./Schemas/todos")
let app = express();
app.use(express.json())
// mongoose connect
// NOTE:: setup env file before running
mongoose.connect(process.env.MONGO)

// TODO GET all todos//
app.get("/todos", async (req, res) => {
    console.log(`Request GET /todos`);
    try {
        const results = await Todo.find({});
        console.log("Response : " + results);
        return res.send({ Resources: results, TotalCount: results.length }).status(200)
    } catch (error) {
        return res.send(error).status(500);
    }
})
// TODO GET a TODO
app.get("/todo/:id", async (req, res) => {
    console.log(`Request GET /todo/${req.params.id}`);
    try {
        const reqId = new ObjectId(req.params.id);
        const findTodo = await Todo.findById(reqId);
        if (!findTodo) {
            throw {
                status: 404,
                detail: "Resource not found."
            }
        }
        console.log("Response : " + findTodo);
        return res.send(findTodo).status(200)
    } catch (error) {
        if (error.bsonError) return res.send({ detail: error.message, status: 400 });
        return res.send(error).status(error?.status || 500);
    }
})
// TODO CREATE a TODO
app.post("/todo", async (req, res) => {
    console.log(`Request POST /todo`);
    try {
        //
        // THIS CODE BLOCK CAN BE REMOVED IF YOU ALLOW DUPLICATION
        let findTodo = await Todo.findOne(req.body);
        if (findTodo) {
            throw {
                status: 409,
                detail: "Resource already exists"
            }
        }
        //
        //
        req.body._id = new ObjectId();
        await Todo.create(req.body)
        findTodo = await Todo.findById(req.body._id);
        console.log("Response : " + findTodo);
        return res.send(findTodo).status(201)
    } catch (error) {
        return res.send(error).status(error?.status || 500);
    }
})
// TODO UPDATE a TODO
app.put("/todo/:id", async (req, res) => {
    console.log(`Request PUT /todo/${req.params.id}`);
    try {
        const reqId = new ObjectId(req.params.id);
        let findTodo = await Todo.findById(reqId);
        console.log(findTodo)
        if (!findTodo) {
            throw {
                status: 404,
                detail: "Resource not found."
            }
        }
        const { meta } = req.body
        let keys = ["name", "description"];
        meta && Object.keys(meta).forEach(v => {
            keys.push("meta." + v)
        })
        keys.forEach(k => {
            if (k.includes("meta")) {
                let metaKey = k.split(".")[1];
                findTodo.$set(k, meta[metaKey]);
            }
            findTodo.$set(k, req.body[k])
        });
        // await Todo.findByIdAndUpdate(reqId,{$set: req.body})
        await findTodo.save();
        console.log("Response : " + findTodo);
        return res.send(findTodo).status(200);
    } catch (error) {
        if (error.bsonError) return res.send({ detail: error.message, status: 400 });
        return res.send(error).status(error?.status || 500);
    }
})
// TODO DELETE a TODO
app.delete("/todo/:id", async (req, res) => {
    try { 
        const reqId = new ObjectId(req.params.id);
        let findTodo = await Todo.findById(reqId);
        console.log(findTodo)
        if (!findTodo) {
            throw {
                status: 404,
                detail: "Resource not found. Cannot delete a non-existent resource."
            }
        }
        await Todo.findByIdAndDelete(reqId);
        return res.status(204).send();
    } catch (error) {
        if (error.bsonError) return res.send({ detail: error.message, status: 400 });
        return res.send(error).status(error?.status || 500);
    }
})

app.listen(process.env.PORT || 3000, () => console.log("running on PORT 3000"))