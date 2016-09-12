/**
 * 选择弹框插件
 * @author lixq leeyxq@gmail.com
 * @version 1.0
 * https://github.com/leeyxq/boostrap-selectpage
 *  依赖bootstrap-table
 *  依赖bootstrap-modal
 */

(function($) {
    var bootstrapSelectPage = function(input, options) {
        this.$input   = $(input);
        this.options = $.extend({}, bootstrapSelectPage.DEFAULT_OPTIONS, options);

        this._init();
    };

    // 默认配置项
    bootstrapSelectPage.DEFAULT_OPTIONS = {
		url : null,
		surl: null,
		title:'',
		width : "400px",//选择页面宽度
		selectedControl : null,//已选中项值的控件
		singleSelect: true,//是否多选
		columns : [],
		toolbar: null,
		pageSize:5,
		queryParam : function(){//查询参数构造
			return {};
		},
		callback : function(rows) {//选择关闭后回调
			
		}
    };

    bootstrapSelectPage.prototype = {
        constructor: bootstrapSelectPage,

        /**
         * 初始化
         */
        _init: function() {
            var that = this;
            if(that.options.singleSelect){
            	that.options.columns.unshift({title:'',radio:true,align:"center",valign:"middle", width:26,heigth:16});
            }else{
            	that.options.columns.unshift({title:'',checkbox:true,align:"center",valign:"middle", width:26,heigth:16});
            }
            that.dialogId = 'dialog_'+that._uuid(8, 10);
            that._initUI(that.options);
            that.dialog = $('#' + that.dialogId);
            that.modalTable = that.dialog.find('table');
            that._initEvent();
            that.selectedObjects = {};
            if(that.options.surl == null || that.options.surl === ''){//获取已选择id对应的对象服务url，为空时取options.url+?ids=xxxx
            	that.options.surl = that.options.url;
            }
        },
        //初始化UI
       _initUI: function(options){
    	  var _html= '<div class="modal fade" id="'+this.dialogId+'" tabindex="-1" role="dialog" aria-hidden="true">'
			    		+'<div class="modal-dialog" style="margin-top:15%;width:'+options.width+'">'
			    			+'<div class="modal-content">'
			    				+'<div class="modal-header" style="padding: 10px;">'
			    					+'<span class="modal-title">'+options.title+'</span>'
			    					+'<span class="modal-title" style="float:right"><input type="text" placeholder="输入查询内容" name="modalKeyWord" style="color: black;"></input></span>'
			    				+'</div>'
			    				+'<div class="modal-body" style="padding: 10px;">'
			    					+'<table class="table table-striped table-bordered table-hover table-condensed "></table>'
			    				+'</div>'
			    				+'<div class="modal-footer" style="padding: 10px;">'
			    					+'<button type="button" class="btn btn-primary ok">确定</button>'
			    					+'<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>'
			    				+'</div>'
			    			+'</div>'
			    		+'</div>'
			    	+'</div>';
    	  $(document.body).append(_html);
       },
       _initEvent: function(){
			var that = this;
			that.$input.click(function() {//显示选择页
				$('#' + that.dialogId).modal({
					show : true,
					keyboard : false,
					backdrop : 'static'
				});
				if($(this).data('inited') !== true){
					// 初始化表格数据,只初始化一次
					that.initBootstrapTable();
					$(this).data('inited', true);
				}
				
				//获取已选择对象
				that.selectedObjects = {};
				var selectedIds = $(that.options.selectedControl).val();
				if(selectedIds && selectedIds != ''){
					$.getJSON(that.options.surl, {'ids': selectedIds}, function(data){
						if(data && data.rows){
							$.each(data.rows,function(){
								that.selectedObjects[this.id] = this;
							});
							that.modalTable.bootstrapTable('refresh');
						}
					});
				}else{
					that.modalTable.bootstrapTable('refresh');
				}
			});
			
			that.dialog.find('button.ok').click(function(){
				var arr = [];
				$.each(that.selectedObjects, function(key, value){
					arr.push(value);
				});
				that.options.callback.call(that, arr);
				that.dialog.modal('hide');
			});
       },
	   	// 初始化表格组件
	   	initBootstrapTable : function() {
	   		var that = this
	   			,options=that.options;
	   		that.modalTable.bootstrapTable({
	   			url : options.url,
	   			dataType : "json",
	   			pagination : true, // 分页
	   			striped : true,
	   			singleSelect : options.singleSelect,
	   			pageSize : options.pageSize,
	   			paginationPreText : "上一页",
	   			paginationNextText : "下一页",
	   			paginationDetailHAlign : "left",
	   			clickToSelect : true,
	   			paginationHAlign : "right",
	   			minPagination : true,
	   			sidePagination : "server",
	   			method:'post',
	   			contentType:'application/x-www-form-urlencoded; charset=UTF-8',
	   			columns : options.columns,
	   			queryParams : function(params) {
	   				params.keyWord = $.trim($('#' + that.dialogId).find('[name=modalKeyWord]').val());
	   				$.extend({}, params, options.queryParam());
	   				return params;
	   			},
	   			onLoadSuccess : function(data) {
	   				var  selectedObjects = that.selectedObjects
	   					,_table = that.modalTable;
	   				$.each(_table.bootstrapTable('getData',true), function(i, row){
	   					selectedObjects.hasOwnProperty(row.id+'') && _table.bootstrapTable('check',i,false);
	   				});
	   			},
	   			onCheck : function(row, $element) {
	   				that.selectedObjects[row.id+''] = row;
	   			},
	   			onUncheck : function(row, $element) {
	   				delete that.selectedObjects[row.id+''];
	   			},
	   			onCheckAll : function(rows) {
	   				$.each(rows, function(index, row){
	   					that.selectedObjects[row.id+''] = row;
	   				});
	   			},
	   			onUncheckAll : function(rows) {
	   				$.each(rows, function(index, row){
	   					delete that.selectedObjects[row.id+''];
	   				});
	   			}
	   		});
	   		//构建已选择对象缓存
	   		function _buildSelectedObject(selectedObjects, table){
	   			table.bootstrapTable('getData',true).each(function(index, row){
   					selectedObjects.hasOwnProperty(row.id+'') && that.bootstrapTable('check',i,false);
   				});
	   		} 
	   	},
        //刷新
        refresh: function() {
        	var that = this;
        	$('#' + that.dialogId+' input[name="modalKeyWord"]').val();
        	that.modalTable.bootstrapTable('refresh');
            return that;
        },
        
        //生成随机数
        _uuid: function(len, radix){
   	     var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
   	     var chars = CHARS, uuid = [], i;
   	     radix = radix || chars.length;

   	     if (len) {
   	       for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
   	     } else {
   	       var r;
   	       uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
   	       uuid[14] = '4';
   	       for (i = 0; i < 36; i++) {
   	         if (!uuid[i]) {
   	           r = 0 | Math.random()*16;
   	           uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
   	         }
   	       }
   	     }

   	     return uuid.join('');
      }
    };

    // 插件定义
    $.fn.bootstrapSelectPage = function(option) {
        var params = arguments;
        return this.each(function() {
            var $this   = $(this),
                data    = $this.data('bootstrapSelectPage'),
                options = 'object' == typeof option && option;
            if (!data) {
                data = new bootstrapSelectPage(this, options);
                $this.data('bootstrapSelectPage', data);
            }

            // Allow to call plugin method
            if ('string' == typeof option) {
                data[option].apply(data, Array.prototype.slice.call(params, 1));
            }
        });
    };

    $.fn.bootstrapSelectPage.Constructor = bootstrapSelectPage;

}(window.jQuery));
