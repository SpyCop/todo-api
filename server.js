var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcryptjs');

var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API root');
});

//GET /todos?complete=true&q=work
app.get('/todos', middleware.requireAuth, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

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
		res.status(500).send('You should give valid attributes to select: completed=(true || false)&&q=(validString)');
	});
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuth, function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findOne({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(todo) { //findOne with id and userid
		if (!!todo) {
			res.json(todo);
		} else {
			res.status(404).send('Couldn\'t find this todo');
		}
	}).catch(function(error) {
		res.status(500).send('You should give a valid ID (valid int) to view');
	});
});

// POST /todos 
app.post('/todos', middleware.requireAuth, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);
	});
});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuth, function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted > 0) {
			res.status(204).send();
		} else {
			res.status(404).send('No todo found with that ID');
		}
	}, function(error) {
		res.status(500).send('You should give a valid ID (valid int) to delete');
	});
});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuth, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) {
			todo.update(attributes)
				.then(function(todo) {
					res.json(todo.toJSON());
				}, function(e) {
					res.status(400).json(e);
				});
		} else {
			res.status(404).send('No todo found with that ID');
		}
	}, function(e) {
		res.status(500).send('You should give a valid ID (valid int) to update')
	}, function(e) {
		res.status(404).send('Cannot find todo with this ID');
	});
});

//POST /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body)
		.then(function(user) {
			var token = user.generateToken('authentication');
			if (!!token) {
				res.header('Auth', token).json(user.toPublicJSON());
			} else {
				res.status(401).send('User not found/Bad credentials');
			}
		}, function(e) {
			res.status(401).send('User not found/Bad credentials');
		});
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});