'use strict';
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
var mozjpeg = require('imagemin-mozjpeg');

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var basementConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    basement: basementConfig,
    watch: {
      coffee: {
        files: ['<%= basement.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:server']
      },
      pug: {
        files: ["<%= basement.app %>/**/*.pug"],
        tasks: ["pug:server"]
      },
      less: {
        files: ['<%= basement.app %>/styles/{,*/}*.less'],
        tasks: ['less:server']
      },
      options: {
    livereload: true,
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          base: ['.tmp', 'app'],
          livereload: true,
          open: {
            target: 'http://localhost:9000/'
          },
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', '<%= basement.dist %>/*'],
      server: '.tmp'
    },
    coffee: {
      server: {
        files: [{
          expand: true,
          cwd: '<%= basement.app %>/scripts',
          src: '**/*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      dist: {
        files: [{
          // rather than compiling multiple files here you should
          // require them into your main .coffee file
          expand: true,
          cwd: '<%= basement.app %>/scripts',
          src: '**/*.coffee',
          dest: '<%= basement.dist %>/scripts',
          ext: '.js'
        }]
      }
    },
    pug: {
      server: {
        files: [{
          expand: true,
          flatten: true,
          cwd: '<%= basement.app %>',
          src: ['*.pug', 'pages/*.pug'],
          dest: '.tmp',
          ext: '.html'
        }],
        options: {
          client: false,
          pretty: true
        }
      },
      dist: {
        files: [{
          // rather than compiling multiple files here you should
          // require them into your main .coffee file
          expand: true,
          flatten: true,
          cwd: '<%= basement.app %>',
          src: ['*.pug', 'pages/*.pug'],
          dest: '<%= basement.dist %>',
          ext: '.html'
        }],
        options: {
          client: false,
          pretty: false
        }
      }
    },
    less: {
      options: {
        paths: ['app/components'],
        cssDir: '.tmp/styles',
        imagesDir: '<%= basement.app %>/images',
        javascriptsDir: '<%= basement.app %>/scripts',
        fontsDir: '<%= basement.app %>/styles/fonts',
        importPath: 'app/bower_components',
        relativeAssets: true
      },
      server: {
        options: {
          paths: ["<%= basement.app %>/styles"],
          yuicompress: true
        },
        files: {
          ".tmp/styles/styles.css": "<%= basement.app %>/styles/styles.less"
        }
      },
      dist: {
        options: {
          paths: ["<%= basement.app %>/styles"],
          yuicompress: true
        },
        files: {
          "<%= basement.dist %>/styles/styles.css": "<%= basement.app %>/styles/styles.less"
        }
      }
    },
    imagemin: {
      dynamic: {
        options: {
          progressive: 3,
          quality: 50,
        },
        files: [{
          expand: true,
          cwd: '<%= basement.app %>',
          src: '**/*.{png,jpg,gif}',
          dest: 'dist',
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= basement.app %>',
          dest: '<%= basement.dist %>',
          src: [
            '*.{ico,txt}',
            'scripts/**/*.js',
            'styles/fonts/**',
            'CNAME',
            'sitemap.txt',
            '.htaccess',
            'images/{,*/}*.{webp,gif,jpg,png,svg}'
          ]
        }]
      }
    },
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'coffee:server',
      'pug:server',
      'less:server',
      'connect:server',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'coffee:dist',
    'less:dist',
    'pug:dist',
    'imagemin',
    'copy',
  ]);

  grunt.registerTask('deploy', [
    'build',
    'gh-pages',
    'server'
  ]);

  grunt.registerTask('default', [ 'server']);

};
