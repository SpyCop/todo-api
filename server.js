var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'Go to bibliotheq',
	completed: true
}];

app.get('/', function (req, res) {
	res.send('Todo API root');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);

	var todo = require('./todoByID.js'); //id, todos
	todo(todoID, todos)
	.then(function (todo) {
		res.json(todo);
	})
	.catch (function (error) {
		res.sendStatus(404).send('Not found');
	});
});


app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});