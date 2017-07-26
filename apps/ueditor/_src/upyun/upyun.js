/**
 * Created by lizifen on 17/2/18.
 */
UE.upyun = function () {

    function UpyunUploader(configs) {
        this.configs = UE.utils.extend(_getDefaultConfigs(), configs);
        this.protocol = location.protocol;
        this.urlPrefix= this.protocol + "//" + this.configs.bucket + ".b0.upaiyun.com";
        this.ajaxConfig={
            timeout:50000,
            csrftoken:_getCookies().csrftoken
        };

        //默认的设置，可以通过uEditor的配置参数动态修改
        function _getDefaultConfigs() {
            return {
                bucket: "qcfile",
                expiration: parseInt(new Date().getTime() / 1000) + 600000,
                'save-key': '/{filemd5}{.suffix}',
                'allow-file-type': 'jpg,jpeg,png,doc,docx,pdf,xls,xlsx,numbers',
                'content-length-range' : '0,1024000'
            }
        }
        
        function _getCookies() {
            var cookie,index,name,
                cookieStr=document.cookie,
                cookieArray=cookieStr.split(';'),
                cookieObj={},
                csrfEle=document.getElementsByName('csrfmiddlewaretoken')[0];

            if(csrfEle)
                return { csrftoken : csrfEle.value }

            for(var i=0;i<cookieArray.length;i++){
                cookie=cookieArray[i];
                index=cookie.indexOf('=');

                if(index>0){
                    name=cookie.substring(0, index).trim();
                    if(cookieObj[name] == undefined){
                        cookieObj[name]=cookie.substring(index+1);
                    }
                }
            }

            return cookieObj;
        }
    }

    UpyunUploader.prototype = {
        upload: function (file, successCb,errorCb, config) {
            var _self = this;
            var _configs = UE.utils.extend(this.configs, config || {});

            UE.ajax.request('/core/signature/', {
                method: 'GET',
                async: true,
                timeout:_self.ajaxConfig.timeout,
                data: _configs,
                csrftoken:_self.ajaxConfig.csrftoken,
                onsuccess: function (event) {
                    event = JSON.parse(event.responseText);
                    var _signature = event.data.signature;
                    var _policy = event.data.policy;
                    var url = _self.protocol + "//v0.api.upyun.com/" + _configs.bucket;

                    var fd = new FormData();
                    fd.append("file", file);
                    fd.append("policy", _policy);
                    fd.append("signature", _signature);
                    //console.log(fd.getAll('file'));

                    UE.ajax.request(url, {
                        method: 'POST',
                        async: true,
                        data: fd,
                        type:'upyun',
                        timeout:_self.ajaxConfig.timeout,
                        onsuccess: successCb,
                        onerror:errorCb
                    })
                },
                onerror: function (event) {

                }
            })
        }
    }

    return UpyunUploader;
}();


