var express = require('express');
var router = express.Router();
const os = require('os');
const fs = require('fs');
const request = require('request');

const DataAccess = require('./todo-db');
var data = new DataAccess();

// To work with the emulator
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

///////////////////////////////////////////
// Todo Sub-App
///////////////////////////////////////////
router.get('/todo', function (req, res, next) {

  res.render('todo', 
  { 
    title: 'Node DemoApp - Todo', 
    todoData: data
  });
});
 

///////////////////////////////////////////
// Todo - Init the database
///////////////////////////////////////////
router.get('/todo/init', function (req, res, next) {
  data.initDatabase()
  .then(d => res.redirect('/todo'))
  .catch(e => next(new Error(e.body))); //res.status(400).send("ERROR! "+e));
});


///////////////////////////////////////////
// Todo API get todos
///////////////////////////////////////////
router.get('/api/todo', function (req, res, next) {
  data.listTodos()
  .then(d => res.send(d))
  .catch(e => next(new Error(e.body))); //res.status(400).send(e));
});


///////////////////////////////////////////
// Todo API - create/update todo
///////////////////////////////////////////
router.post('/api/todo', function (req, res, next) {
  let todo = req.body;

  data.updateOrCreateTodo(todo)
  .then(d => res.send(d))
  .catch(e => next(new Error(e.body))); //res.status(400).send(e));
});


///////////////////////////////////////////
// Todo API - delete todo
///////////////////////////////////////////
router.delete('/api/todo/:id', function (req, res, next) {
  let todo = req.body;

  data.deleteTodo(req.params.id)
  .then(d => res.send(d))
  .catch(e => next(new Error(e.body))); //res.status(400).send(e));
});

module.exports = router;