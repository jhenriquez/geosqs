var Handler = require('./SQSHandler'),
	GeoService = require('./GeolocationProcessor'),
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

consumer.on('MessagesReceived', function (messages) {
	var geoService = new GeoService({messages: messages, serviceUrl: 'http://freegeoip.net/json/', cache: geoCache });

	geoService.on('ProcessCompleted', function (processed) {
		
		processed.forEach(function (message) { 
			console.log('Processed Message: ', message.id ); 
		});

		publisher.createMessages(processed);
		consumer.deleteMessages(processed);
		consumer.emit('done');
	});

	geoService.on('ProcessedFromCache', function (message) {
		console.log('Processed Message Id From Cache: ', message.id);
	});

	geoService.process();
});

consumer.on('ErrorOnMessagesDelete', function (e) {
	console.log(e);
});

consumer.on('NoMessagesReceived', function () {	
	this.emit('done');
});

consumer.on('done', function () {
	console.log('.');
	this.retrieveMessages();
});

consumer.on('DeleteSuccessful', function (messages) {
	console.log('Successfully Removed: ', messages.length);
});

consumer.on('MessagesReceived', function (messages) {
	console.log('Messages Received. Processing: ', messages.length);
});

publisher.on('ErrorOnMessagesCreate', function (e) {
	console.log(e);
});

publisher.on('CreateSuccessful', function (messages) {
	console.log('Successfully Published: ', messages.length);
});

consumer.retrieveMessages();