GeolocationCache.prototype.constructor = GeolocationCache;

function GeolocationCache () {
	var ips = {};

	this.contains = function (pageview) {
		return ips[pageview.ip] && ((ips[pageview.ip].cacheDate - Date.now()) / 36e5) < 24;
	};

	this.cache = function (pageview) {
		if (this.contains(pageview))
			return;
		ips[pageview.ip] = ips[pageview.ip] || {};
		ips[pageview.ip].lat = pageview.lat;
		ips[pageview.ip].long = pageview.long;
		ips[pageview.ip].cacheDate = Date.now();
	};

	this.retrieve = function (pageview) {
		if (!this.contains(pageview))
			return null;
		pageview.lat = ips[pageview.ip].lat;
		pageview.long = ips[pageview.ip].long;
		return pageview;
	};
}

module.exports = GeolocationCache;