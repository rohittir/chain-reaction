

// Grunt file

module.exports = function(grunt) {

      // Project configuration.
      grunt.initConfig({

        // Run the task to smoketest it
        // Static analysis to detect vulnerabilities in the javascript code
        retire: {
            node: ['npm_modules/**'],
            js: ['app/**/*.js', 'config/**/*.js', '*.js', '*.json'],
            options: {
              verbose: true,
              packageOnly: true,
              //jsRepository: 'test-files/jsrepository.json',
              //nodeRepository: 'test-files/npmrepository.json',
              jsRepository: 'https://raw.github.com/RetireJS/retire.js/master/repository/jsrepository.json',
              nodeRepository: 'https://raw.github.com/RetireJS/retire.js/master/repository/npmrepository.json'
            }
        }

      });

      // load grunt-retire
      grunt.loadNpmTasks('grunt-retire');

      // Default task(s).
      grunt.registerTask('default', ['grunt-retire']);

    };