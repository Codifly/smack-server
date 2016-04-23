import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import eslint from 'gulp-eslint';

const scripts = 'src/**/*.js';

gulp.task('lint', () => {
  return gulp.src(scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('devServer', (callback) => {
  nodemon({
    debug: true,
    env: {
      NODE_ENV: 'development'
    },
    execMap: {
      js: 'babel-node'
    },
    script: 'src/index.js',
    tasks: [ 'lint' ],
    watch: './src'
  })
  .once('start', (ev) => {
    callback();
  });
});

gulp.task('default', [ 'devServer' ]);
