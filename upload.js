(function($,w)
{
	var uploadFile=function(cfg)
	{
		var __this,$choose=$(this);
		if($choose.data('uploadinit'))
		{
			return false;
		}
		var config,clickToSendFile,chooseTrigger,prevent=$.noop,times=0,pc,xhrs={};
		var options=
		{
			url:null,
			maxSize:5,
			auto:true,
			multiple:true,
			file:'file',
			separate:false,
			allowExt:['jpg','jpeg','png','gif'],
			before:$.noop,
			success:$.noop,
			error:$.noop,
			onprogress:null,
			data:null,
			processbar:false,
			action:null,
			dataType:'json',
			processContainer:null,
			startBtn:null,
			fileBox:null,
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
		chooseTrigger=function(e){__this=e.currentTarget;$uploadInput.trigger('click');};
		if(config.fileBox)
		{
			var onDrop=function(e)
			{
				if(e.originalEvent.dataTransfer&&e.originalEvent.dataTransfer.files.length>0)
				{
					e.preventDefault();
	                e.stopPropagation();
					checkData(e.originalEvent.dataTransfer.files);
				}
			};
			prevent=function(e){e.preventDefault(); e.stopPropagation();};
			var $fileBox=$(config.fileBox);
			if($fileBox.length)
			{
				$fileBox.on('dragover dragenter',prevent).on('drop',onDrop);
			}
		}
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
		pc=config.processContainer?$(config.processContainer):null;
		pc=pc&&pc.length?pc:null;
		if(pc&&config.action)
		{
			pc.on('click','.action-icon-'+t,config.action);
		}
		var checkData=function(files)
		{
			config.fd=new FormData();
			var fileList=[];
			var fileListItem=[];
			var maxSize=config.maxSize*1048576;
			var sizeError=false;
			var typeError=false;
			var sizeArray=[];
			$.each(files,function(index,item)
			{
				fileListItem.push(item);
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
				sizeArray.push({id:uid(item),size:item.size});
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
						index=uid(item);
						config.fd=new FormData();
						config.fd.append(config.file,item);
						if(config.before(config,index,item)!==false)
						{
							config.fd.append('data',JSON.stringify(config.data));
							var xhr=sendfile(config.fd,[{id:index,size:item.size}],index,item);
							xhrs[index]=xhr;
						}
					});
					return $uploadInput.val('');
				}
				else
				{
					if(config.before(config,files)===false)
					{
						return;
					}
					config.fd.append('data',JSON.stringify(config.data));
					return sendfile(config.fd,sizeArray,null,fileListItem);
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
							index=uid(item);
							config.fd=new FormData();
							config.fd.append(config.file,item);
							if(config.before(config,index,item)!==false)
							{
								config.fd.append('data',JSON.stringify(config.data));
								var xhr=sendfile(config.fd,[{id:index,size:item.size}],index,item);
								xhrs[index]=xhr;
							}
						});
						return $uploadInput.val('');
					}
					else
					{
						if(config.before(config,files)===false)
						{
							return;
						}
						config.fd.append('data',JSON.stringify(config.data));
						return sendfile(config.fd,sizeArray,null,fileListItem);
					}
				};
				$(config.startBtn).on('click',clickToSendFile);
			}
		};

		var sendfile=function(formData,sizeArray,singleIndex,files)
		{
			if(!config.separate)
			{
				$uploadInput.val('');
			}
			var success=function(data,status,request)
			{
				config.success.call(__this,data,status,request,files);
			};
			var error=function(data,status,request)
			{
				config.error.call(__this,data,status,request,files);
			};
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
						if(pc)
						{
							if(singleIndex)
							{
								var singper=Math.floor(loaded/sizeArray[0].size*100) + '%';
								return pc.find('.process-'+singleIndex+' i').stop(true,true).animate({'width':singper},400);
							}
							for(var index in sizeArray)
							{
								var item=sizeArray[index];
								var size=item.size;
								if(loaded>size)
								{
									loaded=loaded-size;
									pc.find('.process-'+item.id+' i').stop(true,true).animate({'width':'100%'},50);
								}
								else
								{
									var per=Math.floor(loaded/size*100) + '%';
									pc.find('.process-'+item.id+' i').stop(true,true).animate({'width':per},400);
									break;
								}
							}
						}
					};
					return xhr;
				},
				success:success,
				error:error,
			};
			var destroy=config.destroy?destroyUpload:$.noop;
			if(config.separate)
			{
				times++;
				return $.ajax(cfg).always(config.always).always(function()
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
				return $.ajax(cfg).always(config.always).done(destroy).done(config.done);
			}
		};

		var destroyUpload=function()
		{
			$uploadInput.remove();
			$choose.off('click',chooseTrigger).data('uploadinit',0);
			$(config.startBtn).off('click',clickToSendFile);
			return pc&&pc.empty();
		};

		var showProcessBar=function(files)
		{
			var html=[];
			var action=config.action?'<i class="action-icon action-icon-'+t+'"></i>':'';
			$.each(files,function(index,item)
			{
				if(item)
				{
					index=uid(item);
					html.push('<div data-id='+index+'><p class="filename file-'+index+'">'+item.name+'('+size(item.size)+')'+'</p><p class="processbar process-'+index+'"><i></i></p>'+action+'</div>');
				}
			});
			return pc&&pc.html(html.join(''));
		};
		var clear=function(k)
		{
			if(k)
			{
				return pc.find('[data-id='+k+']').remove();
			}
			return pc&&pc.empty();
		};
		var get=function(k)
		{
			return xhrs[k];
		};
		return {destroy:destroyUpload,input:$uploadInput,button:$choose,clear:clear,get:get,uid:uid};
	};
	uploadFile.version="1.0";

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
	function uid(file)
	{
		return w.btoa(encodeURI(file.lastModified+file.name+file.size)).replace(/[^\w]+/g,'');
	}
	$.fn.uploadFile=uploadFile;

})(jQuery,window);


