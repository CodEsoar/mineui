/**
 * @name aralex.View
 * @class
 * 这个组件主要是用来对组件的展现进行控制的,目前就先放2个方法,show,hide 
 * @author hui.kang@alipay.com
 * @example
*/
arale.declare('aralex.View',null,{
    /** @lends aralex.View.prototype */
	show: function(){
		this.domNode && $Node(this.domNode).setStyle("display","block");
	},
	hide: function(){
		this.domNode && $Node(this.domNode).setStyle("display","none");
	}
})

/**
 * @name aralex.Widget
 * @class
 * Arale所有组件的基类，它规定了组件的声明周期，和一些常见的接口
 * @author <a href="hui.kang@alipay.com">康辉</a>
 */

arale.declare('aralex.Widget', null, {
    /** @lends aralex.Widget.prototype */

    //组件所要处理的对象的id,这个和下面的domNode互斥,两者只能设置其一
    id: null,

    //组件所要处理的对象
    domNode: null,

    init: function(params) {
        //一些初始化的内容,在这个里面可以更改params里面的东西
        //TODO 需要不需要把模版里面的空行,啥的给去掉
    },
    create: function(params) {
        arale.mixin(this, params, true);
        //为了方便垃圾收集,我们把在我们绑定到我们widget的事件都给放到这里面,当我们的widget destory的时候,去进行处理
        this._connects = [];

        this.actionFilters = {};

        this.beforeCreate.apply(this, arguments);
        //初始化dom,根据不同的基类组件可以有自己初始化base dom的方式
        this.initDom.apply(this, arguments);
        //绑定事件
        this.bind.apply(this, arguments);
        this.postCreate();
        this._created = true;
    },
    beforeCreate: function() {

    },
    initDom: function() {
        if (this.id) {
            this.domNode = $(this.id);
        }
    },
    postCreate: function() {
        //一些需要组件初始化完成后才能做的事情放到这里
    },
    bind: function() {
        //之类可以在这里进行覆盖,绑定自己需要的事件
    },
    /**
     * 添加一个需要绑定widget元素的事件
     * @param { String } event 事件名称,绑定那个事件.
     * @param { Function } handler 具体的处理函数.
     * @param { String } selector 一个选择表达式,用来指定widget具体响应事件的元素.
     * @example
     * this.add
     * @return {dom}
     */
    addEvent: function(eventType, handler, selector) {
        var handler = $E.delegate(this.domNode, eventType, arale.hitch(this, handler), selector);
        this._connects.push(handler);
    },
    /**
     * 给指定的函数添加before,after事件,默认是发布事件,fn
     * @param { String } fn 需要绑定的事件名称.
     * @example
     * this.aroundFn('show');
     * @return {Void}
     **/
     aroundFn: function(fn) {
         var that = this;
         var tracer = {
             before: function() {
                 $E.publish(that._getEventTopic(fn, 'before'), [].slice.call(arguments));
             },
             after: function() {
                 $E.publish(that._getEventTopic(fn, 'after'), [].slice.call(arguments));
             }
             /*
             around: function() {
                 $E.publish(that._getEventTopic(fn, 'before'), [].slice.call(arguments));
                 var retVal = arale.aspect.proceed.apply(null, arguments);
                 $E.publish(that._getEventTopic(fn, 'after'), [].slice.call(arguments));
                 return retVal;
             }
             */
         };
         $Aspect.advise(this, fn, tracer);
         this.defaultFn(fn);
     },
     defaultFn: function(fn) {
         var b = 'before' + $S(fn).capitalize();
         var a = 'after' + $S(fn).capitalize();
         this[b] && this.before(fn, this[b]);
         this[a] && this.after(fn, this[a]);

         var that = this;
         var tracer = {
             around: function() {
                 var checkFuncs;
                 if(checkFuncs = that.getActionFilters_(fn)) {
                     for(var e in checkFuncs) {
                         var isValid = checkFuncs[e];
                         if (arale.isFunction(isValid) && !isValid.apply(that, arguments)) {
                             return;
                         }
                     }
                 }
                 return arale.aspect.proceed.apply(null, arguments);
             }
         };
         $Aspect.advise(this, fn, tracer);
     },

     /**
      * 增加一个actionFilter。使用actionFilter对某个函数进行过滤，若filter返回true，则函数有机会执行。
      * 若actionFilter返回false，则函数被拒绝执行。
      * @param {string} fn 要过滤的函数
      * @param {function:boolean} filter 控制函数，若此函数的返回值为false，则拒绝执行被控制的函数.
      * @return {Array} 此处返回的是一个句柄，用来移除此filter。
      */
     addActionFilter: function(fn, filter) {
         var id = arale.getUniqueId();
         (this.actionFilters[fn] || (this.actionFilters[fn] = {}))[id] = filter;
         return [fn, id];
     },

     getActionFilters_: function(fn) {
         return this.actionFilters[fn];
     },

     /**
      * 删除制定的actionFilter
      * @param {Array} handler 调用addActionFilter返回的句柄
      */
     removeActionFilter: function(handler) {
         if(arale.isArray(handler)) {
             var fn = handler[0], id = handler[1];
             if(fn && arale.isNumber(id) && arale.isObject(this.actionFilters[fn])) {
                 delete this.actionFilters[fn][id];
             }
         }
     },

     _getEventTopic: function(fn, phase) {
         return this.declaredClass + '/' + (this.id || 1) + '/' + fn + '/' + phase;
     },
     before: function(fn, callback) {
         return $E.subscribe(this._getEventTopic(fn, 'before'), arale.hitch(this, callback));
     },
     after: function(fn, callback) {
         return $E.subscribe(this._getEventTopic(fn, 'after'), arale.hitch(this, callback));
     },
     rmFn: function(handler) {
         $E.unsubscribe(handler);
     },
     /**
      **改变对象属性值
      */
     attr: function(key, value) {
         if ((key in this) && value !== undefined) {
             return (this[key] = value);
         }
         return this[key];
     },
     destroy: function() {
         $A(this._connects).each(function(handler) {
                 $E.disConnect(handler);
             });
     }

});

 //1.默认组件需要一个domNode,这个元素是组件的外围元素.我们默认提供绑定事件addEvent这个方法都是在此元素的基础上的



/**
 * @name aralex.TplWidget
 * @class
 * Arale所有需要模版widget的基类,如果组件需要模版,继承此类
 * @extends aralex.Widget
 * @author <a href="hui.kang@alipay.com">康辉</a>
*/

arale.declare('aralex.TplWidget',aralex.Widget,{
    /** @lends aralex.TplWidget.prototype */
	onlyWidget: false, //全局只有一个widget,算是一个hack
	//如果我们需要给组件在页面提供一个占位符
	srcId:null, 
	
	//可以指定parent,可以是id,也可以是node,这个来让我们的组件dom进入文档结构的指定位置
	parentId:null,
	
	//用来渲染模版的数据
	data:null,

	//模版的路径,需要子类去覆盖,这个在build后会被替换成templateString
	templatePath:null,
	
	//所有的模版会放到这里面
	//如果直接初始化{},会被多个对象共享,由于提供默认全部执行的机制了
	tmpl: null,
	
	//用来从大模版里面抽取具体模版的reg
	tmplReg: /<script\s+type=\"text\/html"\s+id=\"([^"]+)\"[^>]*>([\s\S]*?)<\/script>/g,
	
	//模版的内容
	templateString:null,
	isUrlDecode: true,

	initDom: function(){
		this.tmpl = {};	
		this._initParent();
		//初始化id
		if(!this.id){
			this._initWidgetId.apply(this,arguments);
		}
		//初始化domNode
		//如果在初始化的时候已经提供了domNode,我们就不做处理了
		if(!this.domNode){
			this._initDomNode.apply(this,arguments);
		}
	},
	_initParent: function(){
		this.parentNode = this.parentId ? $(this.parentId) : $(document.body);
	},
	_initWidgetId: function(params){	
		if(this.srcId){
			this.id = this.srcId;
			return;
		}
		if(this.domNode){
			this.id = $(this.domNode).attr("id");
		}else{
			this.id = arale.getUniqueId(this.declaredClass.replace(/\./g,"_"));	
		}			
	},
	_initDomNode: function(params){
		//目前这两个方法只能针对之定义templatePath,如果用户传进来的domNode,目前还不能实现下面两个方法
		this._initTmpl();
		this._mixinProperties();
		
		this.domNode = $Node($D.toDom(this.templateString));
		//this.domNode.setStyle('display','none');
		this.domNode.attr("id", this.id);
		if(this.srcId){
			$(this.srcId).replace(this.domNode);
		}else{
			this.domNode.inject(this.parentNode.node,"bottom");
		}	
		//if有数据个进行数据渲染
		if(this.data){
			//具体根据数据渲染模版的内容
			//这个data需要指定模版的id,
			this.renderData(this.data);
		};
	},
	_mixinProperties: function(){
		this.templateString = $S(this.templateString).substitute(this);
	},
	_initTmpl: function(){
		//这个主要是用来从我们提供的模版中抽取具体可以和数据渲染的模版
		//如果用户只有一个模版我们可以选择把id赋值到一个默认值,这样就不用在渲染的时候指定模版值了,会影响点效率
		var that = this;
		if(!this.templateString){
			this.templateString = $Ajax.text(this.templatePath);
		}else{
			//因为在服务器压缩的时候,对templateString做了encode,urlDecode
			if(this.isUrlDecode){
				this.templateString = $S(this.templateString).urlDecode();		
			}	
		}
		var num = 0,defaultTmpl;
		this.templateString = this.templateString.replace(this.tmplReg,
			function(tmpl,id,tmplContent){
				that.tmpl[id] = tmplContent;
				num++;
				defaultTmpl = id;
				return "";
			}
		);
		if(num == 1){
			this.defaultTmpl = defaultTmpl;
		}
	},
	renderData: function(data,tmplId,isReplace){
		var that = this;
		//因为这个可能根据不同的模版渲染情况可能不一样,用户可以选择覆盖。
		//默认的规则就是进行整个替换
		//目前考虑的是不是所有的模版都应该在一个有标示的区域中,比如在<script>标签中,这样的话,下面那句话可以修改
		if(tmplId){	
			this._fillTpl(data,tmplId,isReplace);
		}else{
			$H(this.tmpl).each(function(tmplId,tmpl,isReplace){
				that._fillTpl(data,tmplId);
			});	
		}
	},
	/**
     * 填充模版
     * @param { String } 模版id
	 * @param { Object } 需要用来渲染模版的数据
	 * @param { Boolean } 是把整个模版把容器替换掉,还是添加到模版容器里面
     * @example
     * this.fillTpl(tmplId,data,true);
     * @returns void;
     */
	_fillTpl: function(data,tmplId,isReplace){
		var html = this.getTmplHtml(data,tmplId);		
		if(isReplace){
			var id = $(this._getTmplId(tmplId)).attr('id');
			var node = $D.toDom(html);
			$Node(node).attr("id",id);
			$D.replace($Node(node).node,node);
		}else{
			$(this._getTmplId(tmplId)).setHtml(html);	
		}
		
	},
	/**
	* 这个算是一个hack吧,因为在联系人中,模版的id被大量在程序中用到,所以改动比较困难,本来模版的id只能用在模版的程序中的
	* 现在只能通过参数来控制页面的组件的个数,如果页面中只有一个组件,那么我们没有必要在和模版对应的dom元素的id前面在绑定
	* widget的id了
	**/
	_getTmplId: function(tmplId){
		if(this.onlyWidget){
			return tmplId;	
		}else{
			return this.id+"_"+tmplId;		
		}	
	},
	/**
     * 根据数据获取模版的内容
     * @param { String } 模版id
	 * @param { Object } 需要用来渲染模版的数据
     * @example
     * this.getTmplHtml(tmplId,data);
     * @returns String;
     */	
	getTmplHtml: function(data,tmplId){
		var tmpl = this.tmpl[tmplId];
		return arale.tmpl(tmpl,data, this);
	}
});

//TODO
//模版处理,因为在模版中可能包含2部分内容,一个外观,还有一个就是有一部分内容是需要进行模版渲染的.那么我们怎么把这部分内容抽取出来,进行渲染呢？
//具体的说就是给定模版名称(一个大模版里面可能包含若干小的模版,这个模版用来渲染不同的内容),渲染模版内部指定的内容也就是说

