var EventEmitter = require('events').EventEmitter, http = require('http');

GeolocationHandler.prototype = Object.create(EventEmitter.prototype);
GeolocationHandler.prototype.constructor = GeolocationHandler;

function GeolocationHandler(cfg) {

	var configuration = cfg;
	var processed = [];

	function processMessage (message, next, onErr) {
		if (configuration.cache.contains(message)) {
			console.log('From cache.');
			return next(configuration.cache.retrieve(message));
		}

		http.get(configuration.serviceUrl + message.view.ip, function (rs) {
			var body = '';

			rs.on('data', function (portion) {
				body += portion;
			});

			rs.on('end', function ()  {
				var rs = JSON.parse(body);
				message.view.lat = rs.latitude;
				message.view.long = rs.longitude;
				configuration.cache.cache(message);
				next(message);
			});
		}).on('error', onErr);
	};

	this.process = function () {
		if (configuration.messages.length === 0) {
			return this.emit('NoMessages');
		}

		var self = this;

		var message = configuration.messages.shift();

		processMessage(
			message,
			function (rs) {
				console.log(rs);
				processed.push(rs);
				if (processed.length < configuration.messages.length) {
					process();
				} else {
					processed = [];
					self.emit('ProcessCompleted', processed);
				}

			},
			function (e) {
				console.log('error!', e);
			}
		);
	};
};

module.exports = GeolocationHandler;