/*global module: true */

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                src: ['webapp/js/main.js'],
                dest: 'webapp/js/build/web-bundle.js',
                options: {
                    debug: true,
                    standalone: "annotald"
                }
            },
            test: {
                src: 'test/spec/*.js',
                dest: 'test/build/spec-entry.js',
                options: {
                    external: 'webapp/js/**/*.js'
                }
            }
        },
        jasmine: {
            src: "webapp/js/build/web-bundle.js",
            options: {
                specs: "test/build/spec-entry.js"
            }
        },
        watch: {
            dist: {
                files: ['webapp/js/*.js'],
                tasks: ['browserify:dist'],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['browserify']);
    grunt.registerTask('test', ['build', 'jasmine']);
};