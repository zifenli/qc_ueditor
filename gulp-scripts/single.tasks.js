/**
 * Created by lizifen on 16/11/14.
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
var options = require('./options');

var VERSION;
var tasks = {};
var project = options.dir;

//收集每个项目的静态文件，放到dist目录下面
tasks.collectDists = function (src, dest) {
    src = src || [`${dirVars.rootDir}/apps/${project}/dist/**/*`, `!${dirVars.rootDir}/apps/${project}/dist/*`];
    dest = dest || `${dirVars.destDir}/${project}/`;

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
            json[project] = json[project] || {};
            json[project].version = VERSION;
            json[project].dev = {
                "_env": "development",
                "_root": `/static/${project}/`
            }
            json[project].pro = {
                "_env": "production",
                "_root": compiled({version: VERSION, project: project})
            }
            return json;
        }))
        .pipe(gulp.dest(dirVars.versionRootDir));
};
//替换所有非模版文件里面的静态文件的路径(js,css等)，之后如果加入font或其他不需要替换的资源，需要排除
tasks.replaceCdnLink = function () {
    var proConfig=require(buildConfig[project].config);
    var compiled = _.template(deployConfig.cdnLink);

    var src = [`${dirVars.destDir}/${project}/**/*`, `!${dirVars.destDir}/${project}/img/**`];
    var dest = `${dirVars.destDir}/${project}/`;

    return gulp.src(src)
        .pipe($.replace(proConfig.preBuild.assetsPublicPath, compiled({version: VERSION, project: project})))
        .pipe(gulp.dest(dest));
};
//上传CDN，./dist下的所有文件
tasks.uploadCdn = function (src) {
    var compiled = _.template(deployConfig.cdnFolder);

    src = `${dirVars.destDir}/${project}/**/*`;

    return gulp.src(src)
        .pipe($.upyun.upyunDest(compiled({version: VERSION, project: project}), deployConfig.cdnAccount))
};

tasks.clean = function (src) {
    src = src || [`${dirVars.rootDir}/apps/${project}/dist/`, `${dirVars.rootDir}/dist/${project}/`,];

    return gulp.src(src, {read: false})
        .pipe($.clean());
};
module.exports = tasks;