// Global todo model
var todos;

function loadAllTodos() {
   $.get(`/api/todo`, res => {
      todos = res;

      res.forEach(todo => {
         addTodoToTable(todo);
      });
   });
}

function clickTodoDone(id) {
   let todo = todos.find(t => { return t.id == id });
   todo.done = !todo.done;
   updateTodo(todo, success => {
      $(`#${id} > td > i`)
         .removeClass()
         .addClass(`todo-check fa ` + (todo.done ? 'fa-check-square-o' : 'fa-square-o'));
      let todoTitle = $(`#${id} > td > .todo-title`);
      if(todo.done) { 
         todoTitle.addClass('todo-done'); 
         todoTitle.attr('contenteditable', false);
      } else { 
         todoTitle.removeClass('todo-done'); 
         todoTitle.attr('contenteditable', true);
      }
   });
}

function clearForm() {
   $('#newTitle').val('');
}

function addNewTodo() {
   let todo = {
      id: makeId(6),
      title: $('#newTitle').val(),
      done: false,
      type: $('#newType').val()
   }
   updateTodo(todo, f => { addTodoToTable(todo); todos.push(todo) });
}

function addTodoToTable(todo) {
   $('#todo-table tr:last').after(`<tr id="${todo.id}">
    <td><i class="todo-check fa ${todo.done ? 'fa-check-square-o' : 'fa-square-o'}" onclick="clickTodoDone('${todo.id}')"></i></td>
    <td><div contentEditable="${todo.done ? 'false' : 'true'}" onkeydown="keyFilter(event)" class="todo-title ${todo.done ? 'todo-done' : ''}" onfocusout="editTodo('${todo.id}', this)">${todo.title}</div></td>
    <td>${todo.type}</td>
    <td><button class="btn btn-danger" onClick="deleteTodo('${todo.id}')"><i class="fa fa-trash"></i></button></td>        
    </tr>`);
}

function deleteTodoFromTable(id) {
   $(`#${id}`).remove();
}

function editTodo(id, e) {
   let todo = todos.find(t => { return t.id == id });
   todo.title = e.innerHTML;
   updateTodo(todo, success => { })
}

function deleteTodo(id, e) {
   $.ajax({
      url: `/api/todo/${id}`,
      type: 'DELETE',
      success: f => { deleteTodoFromTable(id) }
   })
}


function updateTodo(todo, callback) {
   $.ajax({
      url: `/api/todo`,
      type: 'POST',
      data: JSON.stringify(todo),
      contentType: 'application/json',
      success: callback
   });
}

// This fixes the behavior of contentEditable with newlines creating divs
function keyFilter(e) {
   if (e.keyCode === 13) {
      document.execCommand('insertHTML', false, '<br/><br/>');
      e.preventDefault(); // doesn't work without this
      return false;
   }
}

function makeId(len) {
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

   return text;
}