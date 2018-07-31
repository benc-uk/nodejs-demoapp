//
// Optional mini todo app which uses MongoDb - only shows up when MONGO_CONNSTR is set
// ----------------------------------------------
// Ben C, July 2018
//

var express = require('express');
var router = express.Router();

const utils = require('./utils');

///////////////////////////////////////////
// Todo Sub-App
///////////////////////////////////////////
router.get('/todo', function (req, res, next) {

  res.render('todo', 
  { 
    title: 'Node DemoApp - Todo' 
  });
});
 
//
// GET todo - return array of all todos, probably should have pagination at some point
//
router.get('/api/todo', function (req, res, next) {
  res.type('application/json');
  res.app.get('data').queryTodos({})
    .then(data => {   
      if(!data) utils.sendData(res, [])
      else utils.sendData(res, data)
    })
    .catch(err => { utils.sendError(res, err) })
})

//
// POST todo - create or edit a new todo
//
router.post('/api/todo', function (req, res, next) {
  res.type('application/json');
  let todo = req.body;

  res.app.get('data').createTodo(todo)
    .then(data => utils.sendData(res, data.ops[0]))
    .catch(err => utils.sendError(res, err));
})

//
// PUT todo - update a todo
//
router.put('/api/todo/:id', function (req, res, next) {
  res.type('application/json');
  let todo = req.body;

  res.app.get('data').updateTodo(todo, req.params.id)
    .then(data => utils.sendData(res, data))
    .catch(err => utils.sendError(res, err));
})

//
// DELETE todo - remove a todo from DB
//
router.delete('/api/todo/:id', function (req, res, next) {

  res.type('application/json');
  res.app.get('data').deleteTodo(req.params.id)
    .then(data => {
      if(data.deletedCount == 0) utils.sendError(res, {msg: `No todo with id ${req.params.id} found to delete`}, 404);
      else utils.sendData(res, {msg: `Deleted doc ${req.params.id} ok`})
    })
    .catch(err => utils.sendError(res, err));
})

module.exports = router;