const gulp = require('gulp')
const tsc = require('gulp-typescript')

const nox = tsc.createProject('tsconfig.json', {
    typescript: require('ttypescript')
})

gulp.task('default', () => {
    return nox.src()
    .pipe(nox())
    .pipe(gulp.dest('lib'))
})

gulp.task('client:generate', () => {
    
})