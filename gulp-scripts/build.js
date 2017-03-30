/**
 * Created by lizifen on 16/8/29.
 * 项目静态文件编译入口，读取的是每个app的编译build文件
 */
var gulp = require('gulp');
var config = require('../config/build.config');
var options = require('./options');
var _ = require('lodash');

//build是可执行脚本
var build = function () {
    var projects = options.dirs;

    _.forEach(projects, function (project) {
        var build_path = options.env === 'prePublish' ? config[project].pre_publish_path : config[project].build_path;

        var build = require(build_path);

        return build;
    })

}

module.exports = build;