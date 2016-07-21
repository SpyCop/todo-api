var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

var todo = require('./todoByID.js'); //id, todos

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API root');
});

//GET /todos?complete=true&q=work
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		var key = (db.env === 'production') ? '$iLike' : '$like';
		where.description = {};
		where.description[key] = '%' + query.q + '%';
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}).catch(function(error) {
		res.status(500).send();
	});
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findById(todoID).then(function(todo) {
		if (!!todo) {
			res.json(todo);
		} else {
			res.status(404).send('Couldn\'t find this todo');
		}
	}).catch(function(error) {
		res.status(500).send();
	});
});

// POST /todos 
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	todo(todoID, todos)
		.then(function(todo) {
			todos = _.without(todos, todo);
			res.json(todo);
		})
		.catch(function(error) {
			res.status(404).send('Todo not found');
		});
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	todo(todoID, todos)
		.then(function(todo) {
			var body = _.pick(req.body, 'description', 'completed');
			var validAttributes = {};

			if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
				validAttributes.completed = body.completed;
			} else if (body.hasOwnProperty('completed')) {
				return res.status(400).send();
			}

			if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
				validAttributes.description = body.description;
			} else if (body.hasOwnProperty('description')) {
				return res.status(400).send();
			}

			_.extend(todo, validAttributes);
			res.json(todo);
		})
		.catch(function(error) {
			res.status(404).send('Todo not found');
		});

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});