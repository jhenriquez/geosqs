module.exports = function (g) {
	g.initConfig({
		pkg: g.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'app.js', 'SQSHandler.js','specs/**/**.js']
		},
		jasmine: {
			all: ['specs/**/**.js']
		}
	});

	g.loadNpmTasks('grunt-contrib-jshint');
	g.loadNpmTasks('grunt-jasmine-node');

	g.registerTask('jasmine', ['jasmine_node']);
	g.registerTask('lint', ['jshint']);

	g.registerTask('default',['lint', 'jasmine']);
};