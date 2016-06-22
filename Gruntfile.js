const mountFolder = (connect, dir) =>
  connect.static(require('path').resolve(dir));

const webpackExampleConfig = require('./webpack.example.config.js');
const webpackDistConfig = require('./webpack.dist.config.js');
const webpackDevConfig = require('./webpack.config.js');

module.exports = (grunt) => {
  // Let *load-grunt-tasks* require everything
  require('load-grunt-tasks')(grunt);

  // Read configuration from package.json
  const folders = {
    src: 'src',
    test: 'test',
    dist: 'dist',
    example: 'example',
  };

  grunt.initConfig({
    folders,

    webpack: {
      example: webpackExampleConfig,
      dist: webpackDistConfig,
    },

    'webpack-dev-server': {
      options: {
        hot: true,
        port: 8000,
        host: '0.0.0.0',
        webpack: webpackDevConfig,
        publicPath: '/assets/',
        contentBase: './<%= folders.src %>/',
      },

      start: {
        keepAlive: true,
      },
    },

    connect: {
      options: {
        port: 8000,
      },

      example: {
        options: {
          keepalive: true,
          middleware: (connect) =>
            [mountFolder(connect, folders.example)]
          ,
        },
      },
    },

    open: {
      options: {
        delay: 500,
      },
      dev: {
        path: 'http://localhost:<%= connect.options.port %>/webpack-dev-server/',
      },
      example: {
        path: 'http://localhost:<%= connect.options.port %>/',
      },
    },

    copy: {
      dist: {
        files: [
          // includes files within path
          {
            flatten: true,
            expand: true,
            src: [
              '<%= folders.src %>/index.html',
            ],
            dest: '<%= folders.example %>/',
            filter: 'isFile',
          },
          {
            flatten: true,
            expand: true,
            src: [
              '<%= folders.src %>/libphonenumber.js',
            ],
            dest: '<%= folders.dist %>/',
            filter: 'isFile',
          },
          {
            flatten: true,
            expand: true,
            src: '<%= folders.dist %>/*.png',
            dest: '<%= folders.example %>/',
          },
          {
            flatten: true,
            expand: true,
            src: '<%= folders.src %>/styles/*',
            dest: '<%= folders.dist %>/styles/',
          },
          {
            flatten: true,
            expand: true,
            src: '<%= folders.src %>/images/*',
            dest: '<%= folders.dist %>/images/',
          },
        ],
      },
    },

    clean: {
      example: {
        files: [{
          dot: true,
          src: [
            '<%= folders.example %>',
          ],
        }],
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= folders.dist %>',
          ],
        }],
      },
    },

    'gh-pages': {
      options: {
        base: 'example',
      },
      src: ['**'],
    },
  });

  grunt.registerTask('publish:examples', ['gh-pages']);

  grunt.registerTask('serve', (target) => {
    if (target === 'example') {
      return grunt.task.run(['clean:dist', 'webpack:dist',
        'build', 'open:example', 'connect:example']);
    }

    return grunt.task.run([
      'open:dev',
      'webpack-dev-server',
    ]);
  });

  grunt.registerTask('build', ['clean:example', 'copy', 'webpack:example']);
  grunt.registerTask('build:dist', ['clean:dist', 'copy', 'webpack:dist']);

  grunt.registerTask('default', []);
};
