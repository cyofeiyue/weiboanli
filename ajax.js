var $={};
$.ajax=ajax;
function json2url(json) {
	var arr=[];
	json.t=Math.random();
	for (var name in json){
		arr.push(name+"="+encodeURIComponent(json[name]));
	}
	return arr.join("&");
}
function ajax(options) {
	options=options||{};
	if (!options.url){
		return;
	}
	options.data=options.data||{};
	options.timeout=options.timeout||0;
	options.type=options.type||"get";
	var str=json2url(options.data);

	//1创建
	if (window.XMLHttpRequest){
		var xhr=new XMLHttpRequest();
	}else {
		var xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (options.type=="get"){
		//2连接
		xhr.open("get",options.url+"?"+str,true);
		//3.发送
		xhr.send();
	}else {
		//2连接
		xhr.open("post",options.url,true);
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		//3发送
		xhr.send(str);
	}
	//4.接收
	xhr.onreadystatechange=function () {
		if (xhr.readyState==4){
			clearTimeout(timer);
			if (xhr.status>=200&&xhr.status<300||xhr.status==304){
				options.success&&options.success(xhr.responseText);
			}else {
				options.error&&options.error(xhr.status);
			}
		}
    };
	//超时
	if (options.timeout){
		var timer=setTimeout(function () {
			xhr.abort();
        },options.timeout);
	}
}