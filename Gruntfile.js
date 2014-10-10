module.exports = function (g) {
	g.initConfig({
		pkg: g.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'app.js', 'SQSHandler.js','specs/**/**.js']
		}
	});

	g.loadNpmTasks('grunt-contrib-jshint');

	g.registerTask('test', ['jshint']);
};