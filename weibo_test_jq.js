$(function () {
    var oText = $("#tijiaoText");
    var oBtn  = $("#btn_send");
    var oMsgList = $("#messList");
    var oPage = $("#page");
    var url = "weibo.php";
    var pageNo = 1;
    var charLimit = 20;

    //分页标签生成
    getPageCount();
    //获取第一页数据
    getPageData()

    oText.each(function () {
        //初始化显示字数
        var length = $(this).val().length;
        $(this).parent().find('#charlength').html('<b>' + length + '</b>')
        //键盘事件后显示字数
        $(this).keyup(function () {
            doCharLimit.call(this);
        })
        $(this).keydown(function () {
            doCharLimit.call(this);
        })

        function doCharLimit() {
            var newLength = $(this).val().length;
            if (newLength >= charLimit) {
                $(this).val($(this).val().substring(0, charLimit));
                $('#charlength').css('background', 'red');
                $(this).parent().find('#charlength').html('<b>' + charLimit + '</b>');
            } else {
                $('#charlength').css('background', 'white');
                $(this).parent().find('#charlength').html('<b>' + newLength + '</b>');
            }
        }

    })
    /*
        weibo.php?act=get&page=1
         返回：[{id: ID, content: "内容", time: 时间戳, acc: 顶次数, ref: 踩次数}, {...}, ...]
    */
    function getPageData() {
        $.ajax({
            url:url,
            type:'GET',
            data:{
                act:'get',
                page:pageNo
            },
            success:function (data) {
                var json = eval("("+data+")");
                //清空上一次数据
                oMsgList.empty();
                $.each(json,function (index,item) {
                    //创建元素
                    //var oDiv = document.createElement("div");
                    //oDiv.className = "reply";
                    var oDiv = createDiv(item);
                    oMsgList.append(oDiv);
                    //绑定事件
                    bindClickEvent(item);
                })
            },
            error:function (xhr) {
                console.log(xhr)
            },
            complete:function (data) {
                //console.log(data)
            }
        })
    }

    function bindClickEvent(item) {
        /*
         weibo.php?act=acc&id=12			顶某一条数据
             返回：{error:0}
        */
        $("#top"+item.id).bind('click',{id:item.id},function (event) {
            $.ajax({
                url:url,
                data:{
                    act:"acc",
                    id:event.data.id
                },
                success: function(str){
                    var json = eval("("+str+")");
                    if(json.error == 0){
                        //oAcc.innerHTML = parseInt(oAcc.innerHTML) + 1;
                        var num = $("#top"+event.data.id).text();
                        $("#top"+event.data.id).text(parseInt(num) + 1)

                    }
                }
            });
        })

        /*
          weibo.php?act=ref&id=12			踩某一条数据
             返回：{error:0}
        */
        $("#down"+item.id).bind('click',{id:item.id},function (event) {
            $.ajax({
                url:url,
                data:{
                    act:"ref",
                    id:event.data.id
                },
                success: function(str){
                    var json = eval("("+str+")");
                    if(json.error == 0){
                        var num = $("#down"+event.data.id).text();
                        $("#down"+event.data.id).text(parseInt(num) + 1)
                    }
                }
            });
        })


        /*
         weibo.php?act=del&id=12			删除一条数据
             返回：{error:0}
        */
        $("#cut" + item.id).bind('click',{id:item.id},function (event) {
            $.ajax({
                url:url,
                data:{
                    act:"del",
                    id:event.data.id
                },
                success: function(str){
                    var json = eval("("+str+")");
                    if(json.error == 0){
                        getPageData();
                        getPageCount();
                    }
                }
            });
        })
    }

    /*
    weibo.php?act=get_page_count	获取页数
         返回：{count:页数}
    */
    function getPageCount(){
        $.ajax({
            url:url,
            data:{act:"get_page_count"},
            success: function(data){
                var json = eval("("+data+")");
                //oPage.innerHTML = "";
                oPage.html("")
                //创建页码 active
                for(var i = 0; i < json.count; i++){
                    //var oA = document.createElement("a");
                    //oA.href = "javascript:;";
                    //oA.innerHTML = i+1;
                    //oPage.appendChild(oA);
                    var oA = $("<a href='javacript:;'></a>");
                    oA.html(i+1);
                    oPage.append(oA);
                }
                //给a标签绑定click方法
                $('#page > a').click(function (event) {
                    //清空之前的active
                    $("#page > a").attr("class","");
                    //设置当前的active
                    //this.attr("class","active"); X
                    //this.className = "active";   O
                    $(this).attr("class","active");

                    //重新加载当前页码的数据
                    pageNo = $(this).text();
                    getPageData();
                })

                //oPage.children[pageNo - 1].className = "active";
                var num = pageNo - 1;
                $('#page > a:eq(' + num + ')').attr("class","active");
            }

        });
    }

    /*
    提交一个消息，生成一个Div
    */
    function createDiv(json) {
        var oDiv = $("<div></div>")
        oDiv.attr("class", "reply");
        var html = '<p class="replyContent">' + json.content + '</p>'
            + '<p class="operation">'
            + '<span class="replyTime">' + moment(json.time*1000).fromNow() + '</span>'
            + '<span class="handle">'
            + '<a href="javascript:;" class="top" id="top' + json.id + '">' + json.acc + '</a>'
            + '<a href="javascript:;" class="down_icon" id="down' + json.id + '">' + json.ref + '</a>'
            + '<a href="javascript:;" class="cut" id="cut' + json.id + '">删除</a>'
            + '</span>'
            + '</p>';
        oDiv.html(html);
        return oDiv;
    }

    /*
    添加一条消息
        weibo.php?act=add&content=xxx	添加一条
        返回：{error:0, id: 新添加内容的ID, time: 添加时间}
        {error: 0`, id: 5, time: 1482475969}
    */
    oBtn.click(function () {
        $.ajax({
            url:url,
            type:'GET',
            async:true, //或false,是否异步
            data:{
                act:'add',
                content:oText.val()
            },
            timeout:5000,    //超时时间
            //dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend:function(xhr){
                //console.log("发送前：" + xhr)
            },
            success:function(data,textStatus){
                var json = eval("(" + data + ")");
                if(json.error === 0){
                    json.content = oText.val();
                    json.ref = 0;
                    json.acc = 0;

                    //在首页提交信息
                    if(pageNo == 1){
                        var oDiv = createDiv(json);
                        if(oMsgList.children().length > 0){
                            oDiv.prependTo(oMsgList);
                        }else {
                            oMsgList.append(oDiv);
                        }
                    }else {
                        //如果在非首页的页面提交留言，需要回到第一页。
                        pageNo = 1;
                        getPageData();
                    }
                    //绑定事件
                    bindClickEvent(json);
                    //获取页码
                    getPageCount()
                }
            },
            error:function(xhr,textStatus){
                //console.log("发送失败：" +data)
            },
            complete:function(xhr,textStatus){
                //console.log('发送结束')
            }
        })
    })
    
    
})

function getTimeStamp(isostr) {
    var parts = isostr.match(/\d+/g);
    return new Date(parts[0]+'-'+parts[1]+'-'+parts[2]+' '+parts[3]+':'+parts[4]+':'+parts[5]).getTime();
}

function add0(m){
    return m < 10 ? '0' + m : m;
}

function format(timeStampStr) {
    //timeStampStr是整数，否则要parseInt转换
    var time = new Date(parseInt(timeStampStr*1000));
    var y = time.getFullYear();
    var m = time.getMonth()+1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y+'-'+add0(m)+'-'+add0(d)+'T'+add0(h)+':'+add0(mm)+':'+add0(s) + 'Z';
}

function formatDate(s){
    var oDate = new Date(s*1000);
    var arr = [
        oDate.getFullYear(),"-",
        oDate.getMonth() + 1,"-",
        oDate.getDate()," ",
        oDate.getHours(),":",
        oDate.getMinutes(),":",
        oDate.getSeconds()
    ];
    return arr.join("");
}

function getTimeByTimeZone(timeZone){
    var d=new Date();
    var localTime = d.getTime(),
        localOffset=d.getTimezoneOffset()*60000, //获得当地时间偏移的毫秒数,这里可能是负数
        utc = localTime + localOffset, //utc即GMT时间
        offset = timeZone, //时区，北京市+8  美国华盛顿为 -5
        localSecondTime = utc + (3600000*offset);  //本地对应的毫秒数
    var date = new Date(localSecondTime);
    console.log("根据本地时间得知"+timeZone+"时区的时间是 " + date.toLocaleString());
    console.log("系统默认展示时间方式是："+ date)
}
