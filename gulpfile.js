const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const del = require('del');

// Таск для компиляции SCSS в CSS
gulp.task('scss', function () {
	return gulp
		.src('./src/scss/main.scss')
		.pipe(
			plumber({
				errorHandler : notify.onError(function (err) {
					return {
						title   : 'Styles',
						sound   : false,
						message : err.message
					};
				})
			})
		)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(
			autoprefixer({
				overrideBrowserslist : [
					'last 2 versions'
				]
			})
		)
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css/'))
		.pipe(browserSync.stream());
});

gulp.task('html', function () {
	return gulp.src('./src/index.html').pipe(gulp.dest('./build/')).pipe(browserSync.stream());
});

// Копирование Изображений
gulp.task('copy:img', function (callback) {
	return gulp.src('./src/img/**/*.*').pipe(gulp.dest('./build/img/'));
	callback();
});

// Копирование Скриптов
gulp.task('copy:js', function () {
	return gulp.src('./src/js/**/*.js').pipe(gulp.dest('./build/js/'));
});
// Копирование favicon
gulp.task('copy:favico', function () {
	return gulp.src('./src/favico/**/*.*').pipe(gulp.dest('./build/favico/'));
});

gulp.task('copy:html', function () {
	return gulp.src('./src/*.html').pipe(gulp.dest('./build/'));
});

// Копирование Шрифтов
gulp.task('copy:fonts', function (callback) {
	return gulp.src('./src/fonts/**/*.*').pipe(gulp.dest('./build/fonts/'));
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function () {
	// Следим за картинками и скриптами и обновляем браузер
	watch(
		[
			'./build/js/**/*.*',
			'./build/img/**/*.*'
		],
		gulp.parallel(browserSync.reload)
	);
	watch('./build/*.html', gulp.parallel(browserSync.reload));

	// Запуск слежения и компиляции SCSS
	watch('./src/scss/**/*.scss', gulp.parallel('scss'));

	// Следим за картинками и скриптами, и копируем их в build
	watch('./src/img/**/*.*', gulp.parallel('copy:img'));
	watch('./src/js/**/*.*', gulp.parallel('copy:js'));
	watch('./src/fonts/**/*.*', gulp.parallel('copy:fonts'));
	watch('./src/*.html', gulp.parallel('copy:html'));
});

// Задача для старта сервера из папки app
gulp.task('server', function () {
	browserSync.init({
		server : {
			baseDir : './build/'
		}
	});
});

gulp.task('clean:build', function () {
	return del('./build');
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно задачи server и watch
gulp.task(
	'default',
	gulp.series(
		gulp.parallel('clean:build'),
		gulp.parallel('scss', 'copy:img', 'copy:js', 'copy:fonts', 'copy:html', 'copy:favico'),
		gulp.parallel('server', 'watch')
	)
);
