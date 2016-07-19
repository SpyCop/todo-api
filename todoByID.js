module.exports = function (id, todos) {
	var matchingTodo;
	return new Promise(
		function (resolve, reject) {
			todos.forEach(function (todo) {
				if (todo.id === id) {
					matchingTodo = todo;
					return resolve(matchingTodo);
				}
			});
			return reject('404');
		}
	);
}