var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

var todo = require('./todoByID.js'); //id, todos

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

	todo(todoID, todos)
	.then(function (todo) {
		res.json(todo);
	})
	.catch (function (error) {
		res.sendStatus(404).send('Todo not found');
	});
});

// POST /todos 
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.sendStatus(400);
	}

	body.description = body.description.trim();

	body.id = todoNextId++;
	todos.push(body);

	res.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);

	todo(todoID, todos)
	.then(function (todo) {
		todos = _.without(todos, todo);
		res.json(todo);
	})
	.catch (function (error) {
		res.sendStatus(404).send('Todo not found');
	});
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});