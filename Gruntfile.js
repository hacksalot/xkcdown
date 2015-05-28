/**
Gruntfile for the xkc(down) project.

Usage: 'grunt [action]:[configuration]:[quick]'

[action] can be 'build' or 'serve'.
[configuration] can be 'release' or 'debug' or 'quick'.

To package a full release build, use:

    grunt build:release

To package and serve a quick debug build, use:

    grunt serve:quick

@module Gruntfile.js
*/

module.exports = function(grunt) {

  var opts = {

    pkg: grunt.file.readJSON('package.json'),

    folders: {
      src: 'app',
      dest: 'dist'
    },

    jsMinExt: '.min',

    clean: {
      dist: 'dist',
      temp: '.tmp'
    },

    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        keepalive: true
      },
      dist: {
        options: {
          open: true,
          // Return HTML content type for extensionless files
          middleware: function(connect, options, middlwares) {
            return [
              function(req, res, next) {
                req.url.match(/\.(\w+)$/) || res.setHeader( 'Content-Type', 'text/html' );
                next();
              },
              connect.static(options.base[0])
            ];
          },
          base: 'dist'
        }
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      deps: {
        src: [
          'bower_components/imagesloaded/imagesloaded.pkgd<%= jsMinExt %>.js',
          'bower_components/packery/dist/packery.pkgd<%= jsMinExt %>.js',
          '.tmp/js/lodash.custom<%= jsMinExt %>.js',
          'bower_components/threejs/build/three<%= jsMinExt %>.js',
          'bower_components/physijs/physi.js',
          'bower_components/extrovert.js/dist/extrovert<%= jsMinExt %>.js',
          '.tmp/js/jst.js',
          '.tmp/js/xkcdown-site<%= jsMinExt %>.js'
        ],
        dest: '<%= folders.dest %>/js/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      xkcdown: {
        files: {
          '.tmp/js/xkcdown-site.min.js': ['src/js/xkcdown-site.js'],
          'dist/js/pjsw.js': ['bower_components/physijs/physijs_worker.js']
        }
      }
    },

    qunit: {
      files: ['test/**/*.html']
    },

    jshint: {
      files: ['Gruntfile.js', 'src/js/xkcdown-site.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        },
        expr: true,
        boss: true
      }
    },

    copy: {
      // Copy core HTML and CSS
      core: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['*.html', '*.css', ],
          dest: '<%= folders.dest %>'
        }]
      },
      // Copy xkcd JS during debug builds
      xkcdown: {
        files: [{
          expand: true,
          flatten: true,
          src: ['src/js/xkcdown-site.js'],
          dest: '.tmp/js'
        }]
      },
      // A separate copy step for Ammo.js, which needs to be placed separately.
      ammo: {
        files: [{
          expand: true,
          flatten: true,
          src: ['bower_components/ammo.js/builds/ammo.js'],
          dest: '<%= folders.dest %>/js'
        }]
      },
      physijs: {
        files: [{
          expand: true,
          flatten: true,
          src: ['bower_components/physijs/physijs_worker.js'],
          dest: 'dist/js',
          rename: function( dest, src ) {
            return 'dist/js/pjsw.js';
          }
        }]
      },
      // Copy images (1500+).
      images: {
        files: [{
          expand: true,
          src: ['img/**'],
          dest: '<%= folders.dest %>'
        }]
      }
    },

    includereplace: {
      main: {
        options: {
          globals: {
            fileExt: '<%= jsMinExt %>'
          }
        },
        expand: true, cwd: 'dist',
        src: 'index.html',
        dest: 'dist'
      }
    },

    // Compile HTML templates to JS.
    jst: {
      compile: {
        files: {
          ".tmp/js/jst.js": ["src/_jst/*.html"]
        }
      }
    },

    // Adjust page <header>s for standalone vs. indevious versions
    htmlbuild: {
      main: {
        src: 'dist/**/index.html',
        dest: 'dist/',
        options: {
          replace: true,
          sections: {
            layout: {
              header: 'src/_tpl/header.html',
              favicons: 'src/_tpl/favicons.html'
            }
          }
        }
      }
    },

    // Output a custom lodash build (~500 bytes instead of 50k)
    lodash: {
      main: {
        dest: '.tmp/js/lodash.custom.js',
        options: {
          include: ['escape']
        }
      }
    },

    sass: {
      options: {
        debugInfo: false,
        lineNumbers: false,
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.{scss,sass}',
          dest: 'dist',
          ext: '.css'
        }]
      }
    }

  };

  grunt.initConfig( opts );
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-lodash');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-contrib-sass');

  var tasks = ['clean', 'jshint', 'copy:physijs', 'uglify:xkcdown', 'lodash',
    'jst', 'concat:deps', 'copy:core', 'copy:ammo', 'htmlbuild',
    'includereplace', 'sass', 'copy:images'];

  function adjust( cfg ) {
    if( cfg === 'debug' ) {
      opts.jsMinExt = '';
      tasks[3] = 'copy:xkcdown';
    }
  }

  grunt.registerTask('build', 'Build the xkc(down) web demo.', function( config ) {
    config = config || 'release';
    adjust( config );
    grunt.task.run( tasks );
  });

  grunt.registerTask('serve', 'Build and serve the xkc(down) web demo.', function( config ) {
    config = config || 'release';
    adjust( config );
    tasks.push('connect:dist');
    grunt.task.run( tasks );
  });

};
