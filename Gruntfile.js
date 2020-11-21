module.exports = function(grunt) {
  const config = require('./.screeps.json')

  grunt.initConfig({
    clean: ['build'],
    babel: {
      options: {
        sourceMap: false,
        presets: ["@babel/preset-env"],
      },
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js'],
          dest: 'build/dist/'
        }],
      },
    },
    copy: {
      flatten: {
        files: [
          {
            expand: true,
            src: ['build/dist/**'],
            dest: 'build/flatten/',
            filter: 'isFile',
            rename: (dest, matchedSrcPath) => {
              return matchedSrcPath.replace(/[\/\\]+/g, '.').replace(/^build\.dist\./, "build/flatten/")
            },
          }
        ]
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
        src: ['build/flatten/*.js']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-screeps')
  grunt.registerTask("default", ["clean", "babel", "copy", "screeps"])
}
