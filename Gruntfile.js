module.exports = function(grunt) {
  const config = require('./.screeps.json')

  grunt.initConfig({
    clean: ['dist'],
    babel: {
      options: {
        sourceMap: true,
        presets: ["@babel/preset-env"],
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.js'],
          dest: 'dist/'
        }],
      },
    },
    screeps: {
      options: {
        server: {
          host: config.host,
          port: config.port,
          http: config.http
        },
        email: config.email,
        password: config.password,
        branch: config.branch,
        ptr: config.ptr
      },
      dist: {
        src: ['dist/*.js']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-screeps')
  grunt.registerTask("default", ["clean", "babel", "screeps"])
}
