light.has("/alipay/security/riskOneKeyConfirm")||function(c){var d={Name:"riskOneKeyConfirm"},d=c.riskOneKeyConfirm=light.deriveFrom(c.base,{render:function(a){light.isFunction(a)&&this._readyList.push(a);this.ready||(this.element=light.node(this.options.uniqElement),this.container=light.node(light.get(this.options.container)),this.ready=!0,this.guideLink=this.container.find(".onekey-guide-link"),this.guideImg=this.container.find(".onekey-guide-img"));for(a=this._readyList;a.length;)a.shift().apply(this)},
postInit:function(){this.stat="init";this.onready(function(){this._bindGuide();this._changeState("waiting");var a=this;this._intervalHandler=setInterval(function(){light.request(a.options.queryUrl,{securityId:a.options.securityId},{method:"JSONP",success:function(b){a._changeState(b.stat)},failure:function(){light.log("failure")}})},3E3);this._timeoutHandler=setTimeout(function(){a._changeState("timeout")},9E5)});this._confirmedList=[]},_bindGuide:function(){var a=this;light.on(this.guideLink[0],
"click",function(){a.guideImg.toggleClass("fn-hide")})},onConfirm:function(a){if("function"!=typeof a)throw Error("onConfirm accept only function.");this._confirmedList.push(a);if("confirmed"==this.stat){for(a=this._confirmedList;a.length;)a.shift().apply(this);this._confirmedList=[]}},getValue:function(){return"confirmed"==this.stat},_changeState:function(a){if(a!=this.stat)switch(this.stat=a,a){case "error":clearInterval(this._intervalHandler);clearTimeout(this._timeoutHandler);this._showMsg(!1,
"\u7cfb\u7edf\u7e41\u5fd9\uff0c\u8bf7\u7a0d\u4faf\u518d\u8bd5\u3002");light.log("\u4e00\u952e\u786e\u8ba4\uff1a\u53d1\u751f\u9519\u8bef");break;case "created":break;case "confirmed":clearInterval(this._intervalHandler);clearTimeout(this._timeoutHandler);this._showMsg(!0,"\u5df2\u786e\u8ba4");light.log("\u4e00\u952e\u786e\u8ba4\uff1a\u5df2\u786e\u8ba4");for(a=this._confirmedList;a.length;)a.shift().apply(this);this._confirmedList=[];break;case "denied":clearInterval(this._intervalHandler);clearTimeout(this._timeoutHandler);
this._showMsg(!1,"\u8d26\u6237\u6388\u6743\u5931\u8d25");light.log("\u4e00\u952e\u786e\u8ba4\uff1a\u5df2\u62d2\u7edd");for(a=this._confirmedList;a.length;)a.shift().apply(this);this._confirmedList=[];break;case "timeout":clearInterval(this._intervalHandler);clearTimeout(this._timeoutHandler);this._showMsg(!1,"\u5df2\u8d85\u65f6\uff0c\u8bf7\u7a0d\u4faf\u518d\u8bd5");light.log("\u4e00\u952e\u786e\u8ba4\uff1a\u5df2\u8d85\u65f6");break;default:light.log("\u4e00\u952e\u786e\u8ba4\uff1a\u672a\u77e5\u72b6\u6001")}},
_showMsg:function(a,b){a?this.element.parent().removeClass("ui-form-item-error"):this.element.parent().addClass("ui-form-item-error");this.container.find(".ui-form-explain").text(b)}},d)}(alipay.security);