var Handler = require('./SQSHandler'),
	creds = require('./cfg/credentials'),
	qs = require('./cfg/queues');

var publisher = new Handler({
	queueUrl: qs.geolocated_pageviews,
	accessKeyId: creds.accessKeyId,
	secretAccessKey: creds.secretAccessKey,
	region: creds.region
});