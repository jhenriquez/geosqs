var AWS = require('aws-sdk'), EventEmitter = require('events').EventEmitter;

SQSHandler.prototype = Object.create(EventEmitter.prototype);
SQSHandler.prototype.constructor = SQSHandler;

function SQSHandler(cfg) {
	EventEmitter.call(this);

	AWS.config.update({
		"accessKeyId": cfg.accessKeyId,
		"secretAccessKey": cfg.secretAccessKey,
		"region": cfg.region
	});

	var amazon = new AWS.SQS();

	var configuration = cfg;

	this.retrieveMessages = function () {
		var self = this;
		amazon.receiveMessage({
			QueueUrl: configuration.queueUrl,
			AttributeNames: ['All'],
			MaxNumberOfMessages: 10,
			VisibilityTimeout: 60,
			WaitTimeSeconds: 20	
		}, 
		function (err, data) {
			if (err) {
				return self.emit('ErrorOnMessagesRetrieve', err);
			}

			if(!data.Messages) {
				return self.emit('NoMessagesReceived');
			}

			self.emit('MessagesReceived',
				data.Messages.map(function (message) {
					var mapped = {
						id: message.MessageId,
						handle: message.ReceiptHandle
					};
					mapped.view = JSON.parse(message.Body);
					return mapped;
				}));
		});
	};

	this.deleteMessages = function (messages) {
		var self = this;
		var entries = messages.map(function (message) {
			return { 
				Id: message.id,
				ReceiptHandle: message.handle
			};
		});
		amazon.deleteMessageBatch({
			QueueUrl: configuration.queueUrl,
			Entries: entries
		}, 
		function (err, data) {
			if (err) {
				return self.emit('ErrorOnMessagesDelete', err);
			}

			if (data.Successful.length === messages.length) {
				return self.emit('DeleteSuccessful', data.Successful);
			}

			self.emit('FailedMessagesDelete', data.Failed);
		});
	};

	this.createMessages = function (messages) {
		var self = this;
		var entries = messages.map(function (message, index) {
			var transform = {Id: message.id };
			transform.MessageBody = JSON.stringify(message.view);
			return transform;
		});
		amazon.sendMessageBatch({
			QueueUrl: configuration.queueUrl,
			Entries: entries
		}, function (err, data) {
			if (err) {
				return self.emit('ErrorOnMessagesCreate',err);
			}

			if (data.Successful.length === messages.length) {
				return self.emit('CreateSuccessful', messages);
			}

			self.emit('FailedMessagesCreate', data.Failed);
		});
	};
}

module.exports = SQSHandler;