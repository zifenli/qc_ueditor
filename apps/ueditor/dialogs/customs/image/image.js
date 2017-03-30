/**
 * Created by lizifen on 17/2/17.
 */
(function () {
    var uploadImage;

    window.onload = function () {
        initTabs();
        initAlign();
        initButtons();
    };

    function initTabs() {
        uploadImage = uploadImage || new UploadImage('queueList');
    }

    /* 初始化对其方式的点击事件 */
    function initAlign() {
        /* 点击align图标 */
        domUtils.on($G("alignIcon"), 'click', function (e) {
            var target = e.target || e.srcElement;
            if (target.className && target.className.indexOf('-align') != -1) {
                setAlign(target.getAttribute('data-align'));
            }
        });
    }

    /* 设置对齐方式 */
    function setAlign(align) {
        align = align || 'none';
        var aligns = $G("alignIcon").children;
        for (i = 0; i < aligns.length; i++) {
            if (aligns[i].getAttribute('data-align') == align) {
                domUtils.addClass(aligns[i], 'focus');
                $G("align").value = aligns[i].getAttribute('data-align');
            } else {
                domUtils.removeClasses(aligns[i], 'focus');
            }
        }
    }

    function initButtons() {
        dialog.onok = function () {
            var list = uploadImage.getInsertList();

            if (list) {
                editor.execCommand('insertimage', list);
            }
        };
    }

    /* 获取对齐方式 */
    function getAlign() {
        var align = $G("align").value || 'none';
        return align == 'none' ? '' : align;
    }

    function UploadImage(target) {
        this.$wrap = target.constructor == String ? $('#' + target) : $(target);
        this.init();
    }

    UploadImage.prototype = {
        init: function () {
            this.imageList = [];
            this.initContainer();
            this.initUploader();
        },
        initContainer: function () {
            var $ = jQuery;
            this.$filelist = $('.filelist');
            this.$queue = $('.queueList');
            this.$statusBar = $('.statusBar');
            this.$progress = $('.progress');
            this.$info = $('.info');
            this.$placeHolder = $('.placeholder');//首次进入有个placeholder
            this.status = '';
        },
        //初始化上传图片按钮
        initUploader: function () {
            var _self = this;
            _self.initUploadBtn('#filePickerReady');

            this.setStatus('pending');
            initButtons();
        },
        //初始化上传图片按钮
        initUploadBtn: function (id) {
            var _self = this, btnWrap = $(id),
              innerDom = this.getInnerDom('pickerBtn', '点击选择图片');
            var div = document.createElement('div');
            div.className = 'pickerBtnWrap';
            div.append(innerDom.input);
            div.append(innerDom.label);
            btnWrap.append(div);
            this.setOnchange('#pickerBtn');
        },
        getInnerDom: function (id, txt) {
            var input = document.createElement('input');
            var label = document.createElement('label')

            input.id = id;
            input.className = 'input';
            input.type = 'file';
            label.className = 'label';
            label.htmlFor = id;
            label.innerHTML = txt ? txt : '';

            return {
                input: input,
                label: label
            };
        },
        setOnchange: function (id) {
            var _self = this;
            var input=$(id);
            var upyunConfig = editor.getOpt('upyunConfig');
            var upyun = new UE.upyun(upyunConfig);
            var urlPrefix=editor.getOpt('imageUrlPrefix');

            input.on('change', function (event) {
                upyun.upload(input[0].files[0], callback, errorCb);
                _self.setStatus('ready');
            })

            function callback(event) {
                event=JSON.parse(event.responseText);

                if(event.code==200){
                    var url=(urlPrefix || upyun.urlPrefix) + event.url
                    _self.updateImageList(input[0].files,url);
                }
            }

            function errorCb(event) {
                console.log(event.message);
            }
        },
        //设置几种状态下页面的展示
        setStatus: function (val) {
            if (val == this.status) return false;

            this.status = val;

            switch (val) {
              /* 未选择文件 */
                case 'pedding':
                    this.$queue.addClass('element-invisible');
                    this.$statusBar.addClass('element-invisible');
                    this.$placeHolder.removeClass('element-invisible');
                    this.$progress.hide();
                    this.$info.hide();
                    break;
              /* 可以开始上传 */
                case'ready':
                    this.$placeHolder.addClass('element-invisible');
                    this.$queue.removeClass('element-invisible');
                    this.$statusBar.removeClass('element-invisible');
                    this.$filelist.removeClass('element-invisible');
                    this.$progress.hide();
                    this.$info.show();
                    this.refresh();
                    break;
            }
        },
        refresh: function () {
            var $ = jQuery;

            switch (this.status) {
                case 'ready':
                    updateReadySt.apply(this);
                    break;
            }

            //ready状态时需要更新filePickerBlock和filePickerBtn按钮
            function updateReadySt() {
                var filePickerBlock = $('#filePickerBlock'),
                  filePickerBtn = $('#filePickerBtn'),
                  innerDom1 = this.getInnerDom('filePickerBlockInput'),
                  innerDom2 = this.getInnerDom('filePickerBtnInput', '继续添加');

                innerDom1.label.style = 'display:inline-block;width:100%;height:100%;opacity:0';
                innerDom2.label.style = 'display:inline-block;padding:0 18px;line-height:30px;border:1px solid #eee;border-radius:4px;';

                filePickerBlock.append(innerDom1.input);
                filePickerBlock.append(innerDom1.label);
                filePickerBtn.append(innerDom2.input);
                filePickerBtn.append(innerDom2.label);

                this.setOnchange('#filePickerBlockInput');
                this.setOnchange('#filePickerBtnInput');
            }
        },
        //更新图片列表
        updateImageList: function (val,url) {
            var size = 0;

            this.imageList.push({files:val,url:url});
            this.refreshFileList();
            setInfo.apply(this);

            function setInfo() {
                for (var i = 0, len = this.imageList.length; i < len; i++) {
                    size += this.imageList[i].files[0].size;
                }
                size = size / 1024;
                this.$info[0].innerHTML = '选中' + this.imageList.length + '张图片，共' + size.toFixed(2) + 'k';
            }
        },
        //更新展示图片的dom节点
        refreshFileList: function () {
            var _self=this;

            var filePickerBlock = $('#filePickerBlock');
            var liDoms = this.$filelist.children();

            //添加
            if (liDoms.length <= this.imageList.length) {
                createDom(this.imageList[this.imageList.length - 1].files[0], this.imageList.length);
            }

            function createDom(file, id) {
                var li = document.createElement('li');
                var img = document.createElement('img');
                var div = document.createElement('div');
                var imgReader = new FileReader();

                div.innerHTML='删除';
                div.className='file-panel';
                img.style = "width:100%";
                li.id = 'FILE-' + id;

                imgReader.readAsDataURL(file);
                imgReader.onload = function () {
                    img.src = this.result;
                    li.append(img);
                    li.append(div);
                    filePickerBlock.before(li);
                }

                li.addEventListener('click',function (event) {
                    if(event.target.className == 'file-panel'){
                        var id=this.id.match(/-(\d+)/)[1];

                        //执行删除代码
                        _self.imageList.splice(--id,1);
                        $(this).remove();

                        var children=$(this).parent().find('li');

                        for(var i=0;i<children.length-1;i++){
                            children[i].id='FILE-'+(++i);
                        }
                    }
                })
            }

        },
        getInsertList: function () {
            var i, data, list = [],
              align = getAlign();

            for (i = 0; i < this.imageList.length; i++) {
                data = this.imageList[i];
                list.push({
                    src: data.url,
                    _src: data.url,
                    alt: data.original,
                    floatStyle: align
                });
            }
            return list;
        }

    }
}());
