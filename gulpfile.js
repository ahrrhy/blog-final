/**
 * Created by Swante on 09.01.2017.
 */
var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat      = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify      = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    imagemin    = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant    = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache       = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов
    jade         = require('gulp-jade'), // Плагин для Jade

gulp.task('sass', function() {
    return gulp.src('scss/**/*.scss')
        .pipe(sass())
        .on('error', console.log)
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream: true}));// Обновляем CSS на странице при изменении
});
gulp.task('jade', function() {
    gulp.src(['template/**/*.jade', '!template/**/_*.jade'])
        .pipe(jade({
            pretty: true
        }))  // Собираем Jade
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(gulp.dest(''))
        .pipe(browserSync.reload({stream: true})); // Записываем собранные файлы
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: '' // Директория для сервера
        },
        notify: false // Отключаем уведомления
    });
});
// Собираем JS

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        //'libs/jquery/dist/jquery.min.js', // Берем jQuery
        //'libs/magnific-popup/dist/jquery.magnific-popup.min.js', // Берем Magnific Popup
        //'libs/bootstrap/dist/js/bootstrap.min.js', // Бутстрап
        //'libs/slick/slick.min.js', // Слайдер
        //'libs/masonry.pkgd.min.js' // Masonry
        'libs/flexslider/jquery.flexslider-min.js'
    ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('js/')); // Выгружаем в папку js
});

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('css/libs.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('css')); // Выгружаем в папку css
});

gulp.task('img', function() {
    return gulp.src('img/**/*') // Берем все изображения
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('img')); //
});

gulp.task('watch', ['jade', 'browser-sync','css-libs','scripts', 'sass' ], function () {
    gulp.watch(['template/**/*.jade'],['jade'], browserSync.reload);
    gulp.watch('scss/**.*scss', ['sass']);
    gulp.watch('*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('build', [ 'img', 'sass', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'css/screen.css',
        'css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));
});
gulp.task('default', ['watch']);