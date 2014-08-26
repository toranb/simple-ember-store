var gulp = require('gulp');
var karma = require('gulp-karma');
var concat = require('gulp-concat');
var gulpFilter = require('gulp-filter');
var transpiler = require('gulp-es6-module-transpiler');

var paths = {
    test: [
        'vendor/jquery.min.js',
        'vendor/handlebars.min.js',
        'vendor/ember.js',
        'vendor/loader.js',
        'vendor/ember-resolver.js',
        'store.js',
        'tests/unit_tests.js',
        'vendor/test-loader.js'
    ]
};

var filter = gulpFilter(function(file) {
  return file.path.indexOf('vendor') === -1;
});

gulp.task('test', function(){
    return gulp.src(paths.test)
        .pipe(filter)
        .pipe(transpiler({
            type: "amd",
            prefix: "js"
        }))
        .pipe(filter.restore())
        .pipe(concat('deps.min.js'))
        .pipe(gulp.dest('dist'))
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});
