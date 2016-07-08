(function($,w)
{
	var uploadFile=function(cfg)
	{
		var config,clickToSendFile,chooseTrigger;
		var options=
		{
			url:null,
			maxSize:5,
			auto:true,
			multiple:true,
			allowExt:['jpg','png','gif'],
			before:$.noop,
			success:$.noop,
			error:$.noop,
			onprogress:null,
			data:null,
			processbar:false,
			dataType:'json',
			processContainer:null,
			startBtn:null,
			destroy:false
		};
		config=$.extend(options,cfg);
		var t=(((1+Math.random())*0x10000000)|0).toString(16);
		var id='uploadfile-'+t;
		var multiple=config.multiple?' multiple="multiple" ':'';
		$('body').append('<input id="'+id+'" type="file" '+multiple+' style="display:none">');
		var $uploadInput=$('#'+id);
		var $choose=$(this);
		chooseTrigger=function(){$uploadInput.trigger('click');};
		$choose.on('click',chooseTrigger);
		$uploadInput.on('change',function()
		{
			var files=this.files;
			if(files.length>0)
			{
				checkData(files);
			}
			else
			{
				console.log('no file selected');
			}
		});

		var checkData=function(files)
		{
			var formData=new FormData();
			var fileList=[];
			var maxSize=config.maxSize*1048576;
			var sizeError=false;
			var typeError=false;
			var sizeArray=[];
			$.each(files,function(index,item)
			{
				if(item.size>maxSize)
				{
					sizeError=item.name+'超过'+config.maxSize+'MB,无法上传!';
				}
				var arr=item.name.split('.');
				if(arr.length<2 || ($.inArray(arr.pop().toLowerCase(),config.allowExt)<0))
				{
					typeError=item.name+'文件类型不允许!';
				}
				var name='file'+index;
				fileList.push(name);
				formData.append(name,item);
				sizeArray.push(item.size);
			});
			if(sizeError)
			{
				return alert(sizeError);
			}
			if(typeError)
			{
				return alert(typeError);
			}
			formData.append('filelist',fileList);
			config.before(config);
			formData.append('data',JSON.stringify(config.data));
			if(config.processbar)
			{
				showProcessBar(files);
			}
			clickToSendFile=function(){sendfile(formData,sizeArray);};
			if(config.auto)
			{
				return sendfile(formData,sizeArray);
			}
			else
			{
				$(config.startBtn).off('click',clickToSendFile).on('click',clickToSendFile);
			}
		};

		var sendfile=function(formData,sizeArray)
		{
			$uploadInput.val('');
			var cfg=
			{
				url:config.url,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				dataType:config.dataType,
				data:formData,
				xhr:function()
				{
					var xhr = $.ajaxSettings.xhr();
					xhr.upload.onprogress = function(e)
					{
						if($.isFunction(config.onprogress))
						{
							return config.onprogress(e,sizeArray);
						}
						var loaded=e.loaded;
						if(!config.processbar)
						{
							return console.log('process '+Math.floor(loaded/e.total*100) + '%');
						}
						var $con=$(config.processContainer);
						for(var index in sizeArray)
						{
							var size=sizeArray[index];
							if(loaded>size)
							{
								loaded=loaded-size;
								$con.find('.process-'+index+' i').animate({'width':'100%'},5);
							}
							else
							{
								var per=Math.floor(loaded/size*100) + '%';
								$con.find('.process-'+index+' i').animate({'width':per},5);
								break;
							}
						}
					};
					return xhr;
				},
				success:config.success,
				error:config.error,
			};
			var destroy=config.destroy?function()
			{
				$uploadInput.remove();
				if(config.processbar)
				{
					$(config.processContainer).empty();
				}
				$choose.off('click',chooseTrigger);
				$(config.startBtn).off('click',clickToSendFile);
			}:$.noop;
			$.ajax(cfg).always(config.always).done(destroy);
		};

		var showProcessBar=function(files)
		{
			var html=[];
			$.each(files,function(index,item)
			{
				html.push('<div><p class="filename file-'+index+' ">'+item.name+'('+size(item.size)+')'+'</p><p class="processbar process-'+index+'"><i></i></p></div>');
			});
			$(config.processContainer).html(html.join(''));
		};
	};

	function size(size)
	{
		var name=['B','KB','MB','GB','TB','PB'];
		var pos=0;
		while(size>=1204)
		{
			size/=1024;
			pos++;
		}
		return size.toFixed(2)+" "+name[pos];
	}
	$.fn.uploadFile=uploadFile;

})(jQuery,window);


