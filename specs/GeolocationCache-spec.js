describe('Geolocation Cache', function () {
	var cache;

	beforeEach(function () {
		var GeoCache = require('../GeolocationCache');
		cache = new GeoCache();
		cache.cache({ ip: '127.0.0.1', lat: 10, long: 20 });
	});

	it('Should have a cache function', function () {
		expect(cache.cache).toBeTruthy();
		expect(typeof(cache.cache)).toBe('function');
	});

	it('Should return true for a previously cache object.', function () {
		expect(cache.contains({ ip: '127.0.0.1', lat: 10, long: 20 })).toBeTruthy();
	});

	it('Should return false for a none previously cache object.', function () {
		expect(cache.contains({ ip: '127.0.0.2', lat: 10, long: 20 })).toBeFalsy();
	});

	it('Should retrieve lat and long for a previously cached ip.', function () {
		expect(cache.retrieve({ip:'127.0.0.1'}).lat).toBeTruthy();
		expect(cache.retrieve({ip:'127.0.0.1'}).long).toBeTruthy();
		expect(cache.retrieve({ip:'127.0.0.1'}).lat).toBe(10);
		expect(cache.retrieve({ip:'127.0.0.1'}).long).toBe(20);
	});
});