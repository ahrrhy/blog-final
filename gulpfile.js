/**
 * Created by Swante on 09.01.2017.
 */
var gulp            = require("gulp"),
    sass            = require('gulp-sass'),
    lr              = require('tiny-lr'), // Минивебсервер для livereload
    jade            = require('gulp-jade'), // Плагин для Jade
    livereload      = require('gulp-livereload'), // Livereload для Gulp
    myth            = require('gulp-myth'), // Плагин для Myth - http://www.myth.io/
    csso            = require('gulp-csso'), // Минификация CSS
    imagemin        = require('gulp-imagemin'), // Минификация изображений
    uglify          = require('gulp-uglify'), // Минификация JS
    concat          = require('gulp-concat'), // Склейка файлов
    connect         = require('connect'), // Webserver
    server          = lr();

gulp.task('sass', function(){
    return gulp.src('sass/**/*.scss')
        .pipe(sass())
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(myth()) // добавляем префиксы - http://www.myth.io/
        .pipe(gulp.dest('css')) // записываем css
        .pipe(livereload(server)); // даем команду на перезагрузку css
});

// Собираем html из Jade

gulp.task('jade', function() {
    gulp.src(['template/**/*.jade', '!template/**/_*.jade'])
        .pipe(jade({
            pretty: true
        }))  // Собираем Jade только в папке ./assets/template/ исключая файлы с _*
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(gulp.dest('../blog-final')) // Записываем собранные файлы
        .pipe(livereload(server)); // даем команду на перезагрузку страницы
});

// Собираем JS

gulp.task('js', function() {
    gulp.src(['js/**/*.js', '!js/vendor/**/*.js'])
        .pipe(concat('common.js')) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
        .pipe(gulp.dest('js'))
        .pipe(livereload(server)); // даем команду на перезагрузку страницы
});

// Копируем и минимизируем изображения

gulp.task('images', function() {
    gulp.src('img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('img'))
});

// Локальный сервер для разработки

gulp.task('http-server', function() {
    connect()
        .use(require('connect-livereload'))
        .listen('9000');

    console.log('Server listening on http://localhost:9000');
});

// Запуск сервера разработки gulp watch

gulp.task('watch', function() {

    // Предварительная сборка проекта
    gulp.run('sass');
    gulp.run('jade');
    gulp.run('images');
    gulp.run('js');

    // Подключаем Livereload
    server.listen(35729, function(err) {
        if (err) return console.log(err);

        gulp.watch('sass/**/*.scss', function() {
            gulp.run('sass');
        });
        gulp.watch('template/**/*.jade', function() {
            gulp.run('jade');
        });
        gulp.watch('img/**/*', function() {
            gulp.run('images');
        });
        gulp.watch('js/**/*', function() {
            gulp.run('js');
        });
    });
    gulp.run('http-server');
});

gulp.task('build', function() {
    // css
    gulp.src('sass/screen.scss')
        .pipe(sass()) // собираем stylus
        .pipe(myth()) // добавляем префиксы - http://www.myth.io/
        .pipe(csso()) // минимизируем css
        .pipe(gulp.dest('dist/css/'));// записываем css

    // jade
    gulp.src(['template/**/*.jade', '!template/**/_*.jade'])
        .pipe(jade())
        .pipe(gulp.dest('dist'));

    // js
    gulp.src(['js/**/*.js', '!js/vendor/**/*.js'])
        .pipe(concat('common.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));

    // image
    gulp.src('img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))

});
