const gulp        = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass')(require('sass'));
const rename = require("gulp-rename");
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');

// Static server
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "src" // Будет запускаться LiveServer из папки dist
        }
    });

    gulp.watch("src/*.html").on('change', browserSync.reload);
    gulp.watch("src/assets/js/*.js").on('change', browserSync.reload);
});

gulp.task('styles', function() {
    return gulp.src("src/assets/sass/*.+(scss|sass)")
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest("dist/assets/css"))
        .pipe(browserSync.stream());
});

gulp.task('watch', function(){
    gulp.watch("src/assets/sass/**/*.+(scss|sass|css)", gulp.parallel('styles')); // gulp следит за такими файлами, после запятой прописываем что будет выполняться, когда изменится один из этих файлов
    gulp.watch("src/*.html").on('change', browserSync.reload);
});

gulp.task('html', function() {
    return gulp.src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist/"));
});

gulp.task('scripts', function() {
    return gulp.src("src/assets/js/*.js")
    .pipe(gulp.dest("dist/assets/js"));
});

gulp.task('images', function() {
    return gulp.src("src/assets/img/**/*")
    .pipe(gulp.dest("dist/assets/img"));
});
gulp.task('default', gulp.parallel('watch', 'server', 'html', 'scripts', 'images', 'styles'));