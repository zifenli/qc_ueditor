/**
 * Created by lizifen on 16/10/14.
 */
var path = require('path');
var moduleExports = {};

moduleExports.rootDir=path.resolve(__dirname, '../');
//dist目录下的所有静态文件
moduleExports.distDir = [
    `${moduleExports.rootDir}/apps/*/dist/**/*`,
    `!${moduleExports.rootDir}/apps/*/dist/*`];
//dist目录：发布之前每个项目的所有静态文件都会放到每个项目的dist文件夹底下
moduleExports.destDir = path.resolve(moduleExports.rootDir,'./dist/');
//version所在的目录
moduleExports.versionRootDir = path.resolve(moduleExports.rootDir,'./');
//version文件
moduleExports.versionDir = path.resolve(moduleExports.versionRootDir,'./version.json');
//所有app都放在该目录底下
moduleExports.appsDir = path.resolve(moduleExports.rootDir,'./apps/');
//部署完了之后会清掉所有的dist文件
moduleExports.cleanDir=[
    `${moduleExports.rootDir}/apps/*/dist/`,
    `${moduleExports.rootDir}/dist/`,
];
moduleExports.distDirTemplate=`${moduleExports.rootDir}/apps/<%= project %>/dist/**`;
moduleExports.destDirTemplate=`${moduleExports.rootDir}/dist/<%= project %>/`;

module.exports = moduleExports;