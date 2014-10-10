var Handler = require('./SQSHandler'),
	GeoService = require('./GeolocationHandler'),
	GeoCache = require('./GeolocationCache'),
	creds = require('./cfg/credentials'),
	qs = require('./cfg/queues');

var consumer = new Handler({
	queueUrl: qs.pageviews,
	accessKeyId: creds.accessKeyId,
	secretAccessKey: creds.secretAccessKey,
	region: creds.region
});

var publisher = new Handler({
	queueUrl: qs.geolocated_pageviews,
	accessKeyId: creds.accessKeyId,
	secretAccessKey: creds.secretAccessKey,
	region: creds.region
});

var geoCache = new GeoCache();

consumer.on('messagesReceived', function (messages) {
	console.log("Messages received. Let's process.");
	console.log(messages);
	var geoService = new GeoService({messages: messages, serviceUrl: 'http://freegeoip.net/json/', cache: geoCache });

	geoService.on('ProcessCompleted', function (processed) {
		console.log('processed');
		publisher.createMessages(processed);
		consumer.deleteMessages(processed);
		consumer.emit('done');
	});

	geoService.process();
});

consumer.on('noMessages', function () {	
	this.emit('done');
});

consumer.on('done', function () {
	this.retrieveMessages();
});

consumer.retrieveMessages();