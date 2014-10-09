var AWS = require('aws-sdk'),
	svc = new AWS.SQS();

AWS.config.loadFromPath('cfg/credentials.js');

svc.listQueues({}, function (err, queues) {
	if (err)
		return console.log(err);
	console.log(queues);
});