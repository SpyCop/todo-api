var _ = require('underscore');

module.exports = function (todoId, todos) {
	var matchingTodo;
	return new Promise(
		function (resolve, reject) {
			matchingTodo = _.findWhere(todos, {id: todoId});
			if (matchingTodo) {
				return resolve(matchingTodo);
			} else {
				return reject('404');
			}
		}
	);
}