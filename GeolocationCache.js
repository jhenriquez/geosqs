GeolocationCache.prototype.constructor = GeolocationCache;

function GeolocationCache () {
	var ips = {};

	this.contains = function (pageview) {
		return ips[pageview.view.ip] && ((ips[pageview.view.ip].cacheDate - Date.now()) / 36e5) < 24;
	};

	this.cache = function (pageview) {
		if (this.contains(pageview))
			return;
		ips[pageview.view.ip] = ips[pageview.view.ip] || {};
		ips[pageview.view.ip].lat = pageview.view.lat;
		ips[pageview.view.ip].long = pageview.view.long;
		ips[pageview.view.ip].cacheDate = Date.now();
	};

	this.retrieve = function (pageview) {
		if (!this.contains(pageview))
			return null;
		pageview.view.lat = ips[pageview.view.ip].lat;
		pageview.view.long = ips[pageview.view.ip].long;
		return pageview;
	};
}

module.exports = GeolocationCache;