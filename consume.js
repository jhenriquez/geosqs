var Handler = require('./SQSHandler'),
	GeoService = require('./GeolocationHandler'),
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

consumer.on('messagesReceived', function (messages) {
	console.log("Messages received. Let's process.");

	var geoService = new GeoService({messages: messages, serviceUrl: 'http://freegeoip.net/json/'});

	geoService.on('ProcessCompleted', function (processed) {
		publisher.createMessages(processed);
	});

	geoService.process();
});

publisher.on('errorOnCreateMessages', function (err) {
	console.log(err);
});

publisher.on('createSuccessful', function (messages)  {
	console.log('created! allow me to delete!');
	consumer.deleteMessages(messages);
	console.log('And... run again!');
	consumer.retrieveMessages();
});

consumer.on('deleteSuccessful', function () {
	console.log("Well deleted those... Let's run again!");
	this.retrieveMessages();
});

consumer.on('errorOnMessageRetrieve', function (e) {
	console.log(e);
});

consumer.on('noMessages', function () {	
	console.log('No messages. Call me again!');
	this.retrieveMessages();
});

consumer.retrieveMessages();