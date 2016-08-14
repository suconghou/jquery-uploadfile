(function($,w)
{
	var uploadFile=function(cfg)
	{
		var $choose=$(this);
		if($choose.data('uploadinit'))
		{
			return false;
		}
		var config,clickToSendFile,chooseTrigger,times=0;
		var options=
		{
			url:null,
			maxSize:5,
			auto:true,
			multiple:true,
			file:'file',
			separate:false,
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
			always:$.noop,
			done:$.noop,
			destroy:false,
			typeError:'文件类型不允许!',
			sizeError:'超过XXMB,无法上传!'
		};
		config=$.extend(options,cfg);
		var t=(((1+Math.random())*0x10000000)|0).toString(16);
		var id='uploadfile-'+t;
		var multiple=config.multiple?' multiple="multiple" ':'';
		$('body').append('<input id="'+id+'" type="file" '+multiple+' style="display:none">');
		var $uploadInput=$('#'+id);
		chooseTrigger=function(){$uploadInput.trigger('click');};
		$choose.on('click',chooseTrigger);
		$choose.data('uploadinit',1);
		$uploadInput.on('change',function()
		{
			if(times!==0)
			{
				return;
			}
			var files=this.files;
			if(files.length>0)
			{
				checkData(files);
			}
		});
		var checkData=function(files)
		{
			config.fd=new FormData();
			var fileList=[];
			var maxSize=config.maxSize*1048576;
			var sizeError=false;
			var typeError=false;
			var sizeArray=[];
			$.each(files,function(index,item)
			{
				if(item.size>maxSize)
				{
					if($.isFunction(config.sizeError))
					{
						sizeError={item:item,maxSize:config.maxSize};
					}
					else
					{
						sizeError=item.name+config.sizeError.replace('XX',config.maxSize);
					}
				}
				var arr=item.name.split('.');
				if(arr.length<2 || ($.inArray(arr.pop().toLowerCase(),config.allowExt)<0))
				{
					if($.isFunction(config.typeError))
					{
						typeError={item:item,allowExt:config.allowExt};
					}
					else
					{
						typeError=item.name+config.typeError;
					}
				}
				var name=config.multiple?config.file+index:config.file;
				fileList.push(name);
				if(!config.separate)
				{
					config.fd.append(name,item);
				}
				sizeArray.push(item.size);
			});
			if(sizeError)
			{
				if($.isFunction(config.sizeError))
				{
					return config.sizeError(sizeError);
				}
				return alert(sizeError);
			}
			if(typeError)
			{
				if($.isFunction(config.typeError))
				{
					return config.typeError(typeError);
				}
				return alert(typeError);
			}
			if(config.multiple)
			{
				config.fd.append('filelist',fileList);
			}
			if(!config.separate)
			{
				config.before(config,files);
				config.fd.append('data',JSON.stringify(config.data));
			}
			if(config.processbar)
			{
				showProcessBar(files);
			}
			if(config.auto)
			{
				if(config.separate)
				{
					$.each(files,function(index,item)
					{
						config.fd=new FormData();
						config.fd.append(config.file,item);
						config.before(config,index,item);
						config.fd.append('data',JSON.stringify(config.data));
						sendfile(config.fd,[item.size],index);
					});
					return $uploadInput.val('');
				}
				else
				{
					return sendfile(config.fd,sizeArray);
				}
			}
			else
			{
				if(clickToSendFile)
				{
					$(config.startBtn).off('click',clickToSendFile);
				}
				clickToSendFile=function()
				{
					if(config.separate)
					{
						$.each(files,function(index,item)
						{
							config.fd=new FormData();
							config.fd.append(config.file,item);
							config.before(config,index,item);
							config.fd.append('data',JSON.stringify(config.data));
							sendfile(config.fd,[item.size],index);
						});
						return $uploadInput.val('');
					}
					else
					{
						return sendfile(config.fd,sizeArray);
					}
				};
				$(config.startBtn).on('click',clickToSendFile);
			}
		};

		var sendfile=function(formData,sizeArray,singleIndex)
		{
			if(!config.separate)
			{
				$uploadInput.val('');
			}
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
						var loaded=e.loaded;
						if($.isFunction(config.onprogress))
						{
							config.onprogress(Math.floor(loaded/e.total*100)+'%',e,sizeArray);
						}
						var $con=$(config.processContainer);
						if(singleIndex)
						{
							var singper=Math.floor(loaded/sizeArray[0]*100) + '%';
							return $con.find('.process-'+singleIndex+' i').stop(true,true).animate({'width':singper},400);
						}
						for(var index in sizeArray)
						{
							var size=sizeArray[index];
							if(loaded>size)
							{
								loaded=loaded-size;
								$con.find('.process-'+index+' i').stop(true,true).animate({'width':'100%'},50);
							}
							else
							{
								var per=Math.floor(loaded/size*100) + '%';
								$con.find('.process-'+index+' i').stop(true,true).animate({'width':per},400);
								break;
							}
						}
					};
					return xhr;
				},
				success:config.success,
				error:config.error,
			};
			var destroy=config.destroy?destroyUpload:$.noop;
			if(config.separate)
			{
				times++;
				$.ajax(cfg).always(config.always).always(function()
				{
					if(--times===0)
					{
						destroy();
						config.done();
					}
				});
			}
			else
			{
				$.ajax(cfg).always(config.always).done(destroy).done(config.done);
			}
		};

		var destroyUpload=function()
		{
			$uploadInput.remove();
			if(config.processbar)
			{
				$(config.processContainer).empty();
			}
			$choose.off('click',chooseTrigger).data('uploadinit',0);
			$(config.startBtn).off('click',clickToSendFile);
		};

		var showProcessBar=function(files)
		{
			var html=[];
			$.each(files,function(index,item)
			{
				if(item)
				{
					html.push('<div><p class="filename file-'+index+' ">'+item.name+'('+size(item.size)+')'+'</p><p class="processbar process-'+index+'"><i></i></p></div>');
				}
			});
			$(config.processContainer).html(html.join(''));
		};
		return {destroy:destroyUpload,input:$uploadInput,button:$choose};
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


