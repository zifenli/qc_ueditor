//CDN上的静态文件由文件名和版本号组成
module.exports = {
    qcStaticLink: 'http://static.qingchengfit.cn/qingcheng/frontend/lib/<%= project %>/<%= version %>/',
    cdnLink: 'http://qcfile.b0.upaiyun.com/qingcheng/frontend/lib/<%= project %>/<%= version %>/',
    cdnFolder: 'qcfile/qingcheng/frontend/lib/<%= project %>/<%= version %>/',
    cdnAccount: {
        username: 'chenchiyuan',
        password: 'ccy900303'
    }
}