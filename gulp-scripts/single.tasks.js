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
var inquirer = require('inquirer');

var VERSION;
var versions={};
var tasks = {};
var project = options.dir;

function getVersion() {
    _.forEach(projects,function (project) {
        if(buildConfig[project].version_json){
            var json=fs.readFileSync(buildConfig[project].version_json,'utf8');
            versions[project]=JSON.parse(json).version;
        }
    })
};

//收集每个项目的静态文件，放到dist目录下面
tasks.collectDists = function (src, dest) {
    src = src || [`${dirVars.rootDir}/apps/${project}/dist/**/*`];
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

            getVersion();

            //因为是全量部署，所以每次部署，都要替换每个项目的静态文件的目录
            json[project] = json[project] || {};
            json[project].version = versions[item];
            json[project].dev = {
                "_env": "development",
                "_root": `/static/${project}/`
            }
            json[project].pro = {
                "_env": "production",
                "_root": compiled({version: versions[item] ? versions[item] : VERSION, project: item})
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
        .pipe($.upyun.upyunDest(compiled({version: versions[project] ? versions[project] : VERSION, project: project}), {username:'chenchiyuan',password:password}))
};

tasks.clean = function (src) {
    src = src || [`${dirVars.rootDir}/apps/${project}/dist/`, `${dirVars.rootDir}/dist/${project}/`,];

    return gulp.src(src, {read: false})
        .pipe($.clean());
};

tasks.uploadFiles=function (done) {
    inquirer.prompt([{
        type: 'password',
        message: 'Please enter your password:',
        name: 'password'
    }]).then(function(answers){
        tasks.uploadCdn(answers.password);
        done();
    })
}
module.exports = tasks;