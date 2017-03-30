/**
 * Created by lizifen on 16/8/28.
 * 每一个项目都有自己的一份
 */
var dirVars = require('../config/dir.config')

module.exports = {
    qc_ueditor: {
        build_path: `${dirVars.rootDir}/apps/project1/build-scripts/build.js`,
        pre_publish_path: `${dirVars.rootDir}/apps/project1/build-scripts/pre_build.js`,
        config:`${dirVars.rootDir}/apps/qc_ueditor/config/index.js`,
        version_json:`${dirVars.rootDir}/apps/ueditor/package.json`
    }
}