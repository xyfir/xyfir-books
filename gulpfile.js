const sass = require('gulp-sass');
const gulp = require('gulp');

gulp.task('css', () =>
  gulp.src('./client/styles/style.scss')
    .pipe(sass({ outputStyle: 'compressed' })
    .on('error', sass.logError))
    .pipe(gulp.dest('./static/css'))
);

gulp.task('fontello', () =>
  gulp.src('fontello.json')
    .pipe(require('gulp-fontello')())
    .pipe(gulp.dest('./static/fontello'))
);

gulp.task('favicons', () => {
  const favicons = require('gulp-favicons');

  return gulp.src('icon.png')
    .pipe(favicons({}))
    .pipe(gulp.dest('./static/icons/'));
});