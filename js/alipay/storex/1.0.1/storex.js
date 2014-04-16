define("alipay/storex/1.0.1/storex",["gallery/json/1.0.3/json","arale/base/1.1.1/base","arale/class/1.1.0/class","arale/events/1.1.0/events","gallery/store/1.3.7/store"],function(a,b,c){a("gallery/json/1.0.3/json");var d=a("arale/base/1.1.1/base"),e=a("gallery/store/1.3.7/store"),f=d.extend({_super:!1,initialize:function(a){this._super=a,this._super.deserialize=this.deserialize},_maxRetry:15,set:function(a,b,c,d){try{return c instanceof Date&&(c=c.getTime()),this._super.set(a,this.serialize({value:b,expire:c||-1})),this.addQKey(a),b}catch(e){if(this.trigger("full"),d)for(var f=this._maxRetry;f>0;){f--;var g=this.shiftQKey();if(!g)break;if(this._super.remove(g),null!=this.set(a,b,c))return this.addQKey(a),b}return null}},get:function(a){var b=this._super.get(a),c=b?"undefined"!=typeof b.value?b.value:b:null;return b&&b.expire&&b.expire>0&&b.expire<(new Date).getTime()&&(this.remove(a),c=null,this.trigger("expired")),c},status:function(){return{queueCount:this.getQueueCount(),enabled:this._super.enabled}},_queueKey:"__queue__",getQueue:function(){var a=this.get(this._queueKey),b=a&&a.split("|");if(null!=b)for(var c=0;c<b.length;c++)b[c]=unescape(b[c]);return b||[]},setQueue:function(a){try{for(var b=0;b<a.length;b++)a[b]=escape(a[b]);this._super.set(this._queueKey,a.join("|"))}catch(c){}},addQKey:function(a,b){var c=this.getQueue();-1==this._getIndexOfArray(c,a)?(c.push(a),this.setQueue(c),b||this.trigger("queue_key_added")):(this.removeQKey(a,!0),this.addQKey(a,!0),this.trigger("queue_key_updated"))},shiftQKey:function(){var a=this.getQueue(),b=a.shift();return this.setQueue(a),this.trigger("queue_key_removed"),this.trigger("queue_key_shifted"),b},removeQKey:function(a,b){for(var c,d=this.getQueue();-1!==(c=this._getIndexOfArray(d,a));)d.splice(c,1);this.setQueue(d),b||this.trigger("queue_key_removed")},getQueueCount:function(){return this.getQueue().length},_getIndexOfArray:function(a,b){if(a.indexOf)return a.indexOf(b);for(var c=0,d=a.length;d>c;){if(a[c]===b)return c;++c}return-1},_serialize:function(a){return"JSON"in window&&JSON.stringify?JSON.stringify(a):void 0},serialize:function(a){var b=this._serialize(a);return b.length+"|"+b},deserialize:function(a){if(null!=a){try{a=JSON.parse(a)}catch(b){}if("string"!=typeof a)return a;var c=a.match(/^(\d+?)\|/);if(null!=c&&2==c.length){var d=1*c[1];if(a=a.replace(c[0],""),d!=a.length)return g.trigger("broken"),null;try{a=JSON.parse(a)}catch(b){return g.trigger("broken"),null}}}return a},remove:function(a){this.removeQKey(a),this._super.remove(a)},clear:function(){this._super.clear(),this.trigger("queue_key_removed")},getAll:function(){return this._super.getAll()}}),g=new f(e);c.exports=g});