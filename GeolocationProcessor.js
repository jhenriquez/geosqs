var EventEmitter = require('events').EventEmitter, http = require('http');

GeolocationProcessor.prototype = Object.create(EventEmitter.prototype);
GeolocationProcessor.prototype.constructor = GeolocationProcessor;

function GeolocationProcessor(cfg) {

	var configuration = cfg;
	var processed = [];

	function processMessage (message, next, onErr) {
		if (configuration.cache && configuration.cache.contains(message)) {
			this.emit('ProcessedFromCache', message);
			next(configuration.cache.retrieve(message));
			return;
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

				if (configuration.cache) {
					configuration.cache.cache(message);
				}

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
				processed.push(rs);
				if (processed.length < configuration.messages.length) {
					process();
				} else {
					self.emit('ProcessCompleted', processed);
				}

			},
			function (e) {
				console.log('error!', e);
			}
		);
	};
};

module.exports = GeolocationProcessor;