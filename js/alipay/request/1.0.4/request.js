define("alipay/request/1.0.4/request",["jquery/jquery/1.7.2/jquery"],function(a){function b(a){a||(a={}),a.data||(a.data={});var b=c();return d.isArray(a.data)&&(a.data=d.param(a.data,!1)),"string"==typeof a.data?(-1===a.data.indexOf("_input_charset")&&(a.data+="&_input_charset=utf-8"),b&&-1===a.data.indexOf("ctoken")&&(a.data+="&ctoken="+b)):(a.data._input_charset="utf-8",b&&!a.data.ctoken&&(a.data.ctoken=b)),a}function c(){for(var a=document.cookie.split(/;\s/g),b=0,c=a.length;c>b;b++){var d=a[b].match(/([^=]+)=/i);if(d&&"ctoken"===d[1])return a[b].substring(d[1].length+1)}}var d=a("jquery/jquery/1.7.2/jquery"),e=d.ajax;d.ajax=function(a,c){return"object"==typeof a&&(c=a,a=void 0),/https?:\/\/a.alipayobjects.com/g.test(a||c.url||"")||(c=b(c)),e.call(this,a,c)}});