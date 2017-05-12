/**
 * @description
 * 1.拖放文件到编辑区域，自动上传并插入到选区
 * 2.插入粘贴板的图片，自动上传并插入到选区
 * @author Jinqn
 * @date 2013-10-14
 */
UE.plugin.register('autoupload', function (){

    function sendAndInsertFile(file, editor) {
        var me  = editor;
        //模拟数据
        var loadingHtml, errorHandler, successHandler,upyunConfig,upyun,
            filetype = /image\/\w+/i.test(file.type) ? 'image':'file',
            loadingId = 'loading_' + (+new Date()).toString(36);

        //urlPrefix，maxSize，allowFiles，actionUrl都由upyun提供
        upyunConfig=me.getOpt('upyunConfig');
        upyun=new UE.upyun(upyunConfig);

        errorHandler = function(response) {
            response = JSON.parse(response.responseText);

            var loader = me.document.getElementById(loadingId);
            loader && domUtils.remove(loader);

            me.fireEvent('showmessage', {
                'id': loadingId,
                'content': response.message,
                'type': 'error',
                'timeout': 4000
            });
        };

        if (filetype == 'image') {
            loadingHtml = '<img class="loadingclass" id="' + loadingId + '" src="' +
                me.options.themePath + me.options.theme + '/images/spacer.gif">';

            successHandler = function(response) {
                response = JSON.parse(response.responseText);

                var link = upyun.urlPrefix + response.url,
                    loader = me.document.getElementById(loadingId);
                if (loader) {
                    domUtils.removeClasses(loader, 'loadingclass');
                    loader.setAttribute('src', link);
                    loader.setAttribute('_src', link);
                    loader.setAttribute('alt', response.original || '');
                    loader.setAttribute('data-ratio', (response['image-width'] / response['image-height']).toFixed(2));
                    loader.removeAttribute('id');
                    me.trigger('contentchange',loader);
                }
            };
        } else {
            loadingHtml = '<p>' +
                '<img class="loadingclass" id="' + loadingId + '" src="' +
                me.options.themePath + me.options.theme + '/images/spacer.gif">' +
                '</p>';
            successHandler = function(event) {
                event = JSON.parse(event.responseText);

                var link = (urlPrefix || upyun.urlPrefix) + event.url,
                    loader = me.document.getElementById(loadingId);

                var rng = me.selection.getRange(),
                    bk = rng.createBookmark();
                rng.selectNode(loader).select();
                me.execCommand('insertfile', {'url': link});
                rng.moveToBookmark(bk).select();
            };
        }

        /* 插入loading的占位符 */
        me.execCommand('inserthtml', loadingHtml);

        upyun.upload(file,successHandler,errorHandler);
    }

    function getPasteImage(e){
        //firefox clipboardData 无items
        //return e.clipboardData && e.clipboardData.items && e.clipboardData.items.length == 1 && /^image\//.test(e.clipboardData.items[0].type) ? e.clipboardData.items:null;
        return e.clipboardData && e.clipboardData.files && e.clipboardData.files.length ? e.clipboardData.files : null;
    }
    function getDropImage(e){
        return  e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files:null;
    }

    return {
        outputRule: function(root){
            utils.each(root.getNodesByTagName('img'),function(n){
                if (/\b(loaderrorclass)|(bloaderrorclass)\b/.test(n.getAttr('class'))) {
                    n.parentNode.removeChild(n);
                }
            });
            utils.each(root.getNodesByTagName('p'),function(n){
                if (/\bloadpara\b/.test(n.getAttr('class'))) {
                    n.parentNode.removeChild(n);
                }
            });
        },
        bindEvents:{
            defaultOptions: {
                //默认间隔时间
                enableDragUpload: true,
                enablePasteUpload: true
            },
            //插入粘贴板的图片，拖放插入图片
            'ready':function(e){
                var me = this;
                if(window.FormData && window.FileReader) {
                    var handler = function(e){
                        var hasImg = false,
                            files;
                        //获取粘贴板文件列表或者拖放文件列表
                        files = e.type == 'paste' ? getPasteImage(e):getDropImage(e);
                        if(files){
                            var len = files.length,
                                file;
                            while (len--){
                                file = files[len];
                                //if(file.getAsFile) file = file.getAsFile();
                                if(file && file.size > 0) {
                                    sendAndInsertFile(file, me);
                                    hasImg = true;
                                }
                            }
                            hasImg && e.preventDefault();
                        }

                    };

                    if (me.getOpt('enablePasteUpload') !== false) {
                        domUtils.on(me.body, 'paste ', handler);
                    }
                    if (me.getOpt('enableDragUpload') !== false) {
                        domUtils.on(me.body, 'drop', handler);
                        //取消拖放图片时出现的文字光标位置提示
                        domUtils.on(me.body, 'dragover', function (e) {
                            if(e.dataTransfer.types[0] == 'Files') {
                                e.preventDefault();
                            }
                        });
                    } else {
                        if (browser.gecko) {
                            domUtils.on(me.body, 'drop', function(e){
                                if (getDropImage(e)) {
                                    e.preventDefault();
                                }
                            });
                        }
                    }

                    //设置loading的样式
                    utils.cssRule('loading',
                        '.loadingclass{display:inline-block;cursor:default;background: url(\''
                            + this.options.themePath
                            + this.options.theme +'/images/loading.gif\') no-repeat center center transparent;border:1px solid #cccccc;margin-left:1px;height: 22px;width: 22px;}\n' +
                            '.loaderrorclass{display:inline-block;cursor:default;background: url(\''
                            + this.options.themePath
                            + this.options.theme +'/images/loaderror.png\') no-repeat center center transparent;border:1px solid #cccccc;margin-right:1px;height: 22px;width: 22px;' +
                            '}',
                        this.document);
                }
            }
        }
    }
});