//
// Optional mini todo app which uses MongoDb - only shows up when MONGO_CONNSTR is set
// ----------------------------------------------
// Ben C, July 2018
// Updated June, 2019
//

const express = require('express')
const router = express.Router()
const utils = require('./utils')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
const AppInsights = require('applicationinsights')

const DBNAME = process.env.TODO_MONGO_DB || 'todoDb'
const COLLECTION = 'todos'
let db;

//
// Connect to MongoDB server
//
(async function() {
  try {

    let client = await MongoClient.connect(process.env.TODO_MONGO_CONNSTR, { useNewUrlParser: true, useUnifiedTopology: true })
    db = client.db(DBNAME)
    console.log('### Enabled Todo app. Connected to MongoDB!')
  } catch (err) {
    if (AppInsights.defaultClient) { AppInsights.defaultClient.trackException({ exception: err }) }
    console.log(`### ERROR! ${err.toString()}`)
  }
})()

//
// Render Todo page
//
router.get('/todo', function (req, res, next) {
  res.render('todo', {
    title: 'Node DemoApp: Todo'
  })
})

//
// Todo API: GET  - return array of all todos, probably should have pagination at some point
//
router.get('/api/todo', async function (req, res, next) {
  res.type('application/json')
  try {
    let result = await db.collection(COLLECTION).find({}).toArray()
    if (!result) {
      utils.sendData(res, [])
    } else {
      utils.sendData(res, result)
    }
  } catch (err) {
    utils.sendError(res, err)
  }
})

//
// Todo API: POST - create or edit a new todo
//
router.post('/api/todo', async function (req, res, next) {
  res.type('application/json')
  let todo = req.body
  try {
    let result = await db.collection(COLLECTION).insertOne(todo)
    if (result && result.ops) {
      utils.sendData(res, result.ops[0])
    } else {
      throw 'Error POSTing todo'
    }
  } catch (err) {
    utils.sendError(res, err)
  }
})

//
// Todo API: PUT - update a todo
//
router.put('/api/todo/:id', async function (req, res, next) {
  res.type('application/json')
  let todo = req.body
  delete todo._id
  try {
    let result = await db.collection(COLLECTION).findOneAndReplace({ _id: ObjectId(req.params.id) }, todo)
    if (result) {
      utils.sendData(res, result)
    } else {
      throw 'Error PUTing todo'
    }
  } catch (err) {
    utils.sendError(res, err)
  }
})

//
// Todo API: DELETE - remove a todo from DB
//
router.delete('/api/todo/:id', async function (req, res, next) {
  res.type('application/json')
  try {
    let result = await db.collection(COLLECTION).deleteOne({ _id: ObjectId(req.params.id) })
    if (result && result.deletedCount) {
      utils.sendData(res, { msg: `Deleted doc ${req.params.id} ok` })
    } else {
      throw 'Error DELETEing todo'
    }
  } catch (err) {
    utils.sendError(res, err)
  }
})

module.exports = router