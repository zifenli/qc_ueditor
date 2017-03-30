/**
 * Created by lizifen on 17/2/21.
 */
UE.registerUI('publicbtn', function(editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function() {
            var range=this.selection.getRange();
            var a = range.document.createElement('a');
            a[browser.ie ? 'innerText' : 'textContent'] = '预约团课';
            a.style.display = 'block';
            a.className = 'btn';
            a.target = '_blank';
            a.href = g_btnData[1].url;
            range.insertNode(a).selectNode( a );
            range.collapse().select(true);
            // this.getDialog('link').open();

            // console.log(range);
            // editor.execCommand('inserthtml','<a>插入按钮</a>');
        }
    });
    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: "添加团课预约按钮",
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -725px -100px;',
        //点击时执行的命令
        onclick: function() {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);
        }
    });
    //当点到编辑内容上时，按钮要做的状态反射
    // editor.addListener('selectionchange', function() {
    //     var state = editor.queryCommandState(uiName);
    //     if (state == -1) {
    //         btn.setDisabled(true);
    //         btn.setChecked(false);
    //     } else {
    //         btn.setDisabled(false);
    //         btn.setChecked(state);
    //     }
    // });
    //因为你是添加button,所以需要返回这个button
    return btn;
});

UE.registerUI('privatebtn', function(editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function() {
            var range=this.selection.getRange();
            var a = range.document.createElement('a');
            a[browser.ie ? 'innerText' : 'textContent'] = '预约私教';
            a.style.display = 'block';
            a.className = 'btn';
            a.target = '_blank';
            a.href = g_btnData[0].url;
            range.insertNode(a).selectNode( a );
            range.collapse().select(true);
            // this.getDialog('link').open();

            // console.log(range);
            // editor.execCommand('inserthtml','<a>插入按钮</a>');
        }
    });
    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: "添加私教预约按钮",
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -750px -100px;',
        //点击时执行的命令
        onclick: function() {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);
        }
    });
    //当点到编辑内容上时，按钮要做的状态反射
    // editor.addListener('selectionchange', function() {
    //     var state = editor.queryCommandState(uiName);
    //     if (state == -1) {
    //         btn.setDisabled(true);
    //         btn.setChecked(false);
    //     } else {
    //         btn.setDisabled(false);
    //         btn.setChecked(state);
    //     }
    // });
    //因为你是添加button,所以需要返回这个button
    return btn;
});

UE.registerUI('cardbtn', function(editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function() {
            var range=this.selection.getRange();
            var a = range.document.createElement('a');
            a[browser.ie ? 'innerText' : 'textContent'] = '我的会员卡';
            a.style.display = 'block';
            a.className = 'btn';
            a.target = '_blank';
            a.href = g_btnData[2].url;
            range.insertNode(a).selectNode( a );
            range.collapse().select(true);
            // this.getDialog('link').open();
        }
    });
    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: "添加我的会员卡按钮",
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -775px -98px;',
        //点击时执行的命令
        onclick: function() {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);
        }
    });
    //因为你是添加button,所以需要返回这个button
    return btn;
});