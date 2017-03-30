/**
 * Created by lizifen on 16/10/14.
 * 使用gulp执行CDN部署过程
 */
var gulp = require('gulp');
var buildConfig = require('../config/build.config');
var deployConfig = require('../config/deploy.config');
var dirVars = require('../config/dir.config');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var _ = require('lodash');
var fs = require('fs');
var build = require('./build');

var VERSION;
var tasks = {};
//读取appa目录下的所有文件，得到所有的app
var projects = function () {
    return dirArr = fs.readdirSync(dirVars.appsDir);
}();
//收集每个项目的静态文件，放到dist目录下面
tasks.collectDists = function (src, dest) {
    src = src || dirVars.distDir;
    dest = dest || dirVars.destDir;

    return gulp.src(src)
        .pipe($.rename((path) => {
            path.dirname = path.dirname.replace(/dist\//, '');
        }))
        .pipe(gulp.dest(dest));
};
//生成version.json
tasks.buildVersion = function (src) {
    src = src || dirVars.versionDir;

    if (!fs.existsSync(src)) {
        fs.writeFileSync(src, JSON.stringify({}));
    }
    return gulp.src(src)
        .pipe($.jsonEditor(function (json) {
            json = json || {};

            var compiled = _.template(deployConfig.cdnLink);
            VERSION = Date.now();

            //因为是全量部署，所以每次部署，都要替换每个项目的静态文件的目录
            _.forEach(projects, function (item) {
                json[item] = json[item] || {};
                json[item].version = VERSION;
                json[item].dev = {
                    "_env": "development",
                    "_root": `/static/${item}/`
                }
                json[item].pro = {
                    "_env": "production",
                    "_root": compiled({version: VERSION, project: item})
                }
            })

            return json;
        }))
        .pipe(gulp.dest(dirVars.versionRootDir));
};
//替换所有非模版文件里面的静态文件的路径(js,css等)，之后如果加入font或其他不需要替换的资源，需要排除
tasks.replaceCdnLink = function () {
    var compiled = _.template(deployConfig.cdnLink);

    return _.forEach(projects, function (item) {
        var projectConfig=require(buildConfig[item].config);

        var src = [`${dirVars.destDir}/${item}/**/*`,`!${dirVars.destDir}/${item}/img/**`];
        var dest = `${dirVars.destDir}/${item}/`;

        return gulp.src(src)
            .pipe($.replace(projectConfig.preBuild.assetsPublicPath, compiled({version: VERSION, project: item})))
            .pipe(gulp.dest(dest));
    })
};
//上传CDN，./dist下的所有文件
tasks.uploadCdn = function (src) {
    var compiled = _.template(deployConfig.cdnFolder);

    return _.forEach(projects, function (item) {
        src = `${dirVars.destDir}/${item}/**/*`;

        return gulp.src(src)
            .pipe($.upyun.upyunDest(compiled({version: VERSION, project: item}), deployConfig.cdnAccount))
    })
};

tasks.clean = function (src) {
    src = src || dirVars.cleanDir;

    return gulp.src(src, {read: false})
        .pipe($.clean());
};
module.exports = tasks;