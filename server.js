var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

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

// POST /todos 
app.post('/todos', function (req, res) {
	var body = req.body;

	body.id = todoNextId++;
	todos.push(body);

	res.json(body);
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});