/**
 * Created by wangxiaottt on 16/12/17.
 */
/**
 * Created by lizifen on 16/11/11.
 * tasks:build,publish:[collectDists,buildVersion,replaceCdnLink,uploadCdn,clean,publish
 */
var gulp = require('gulp');
var runSequence = require('run-sequence');
var buildScript = require('./gulp-scripts/build');
var options = require('./gulp-scripts/options');
var tasks = require('./gulp-scripts/all.tasks');


gulp.task('collectDists', function () {
    return tasks.collectDists();
});

gulp.task('buildVersion', function () {
    return tasks.buildVersion();
});

gulp.task('replaceCdnLink', function () {
    return tasks.replaceCdnLink();
});

gulp.task('uploadCdn', function () {
    return tasks.uploadCdn();
});

gulp.task('clean', function () {
    return tasks.clean();
});

gulp.task('uploadFiles',function (done) {
    return tasks.uploadFiles(done);
})

gulp.task('build', buildScript);

gulp.task('publish', function () {
    runSequence(
        ['collectDists','buildVersion']
        //,'replaceCdnLink'
        ,'uploadFiles'
    )
});