## jquery-uploadfile


**use jquery ajax upload multiple files in one request**

### config

| key       | type   | default value | description |
| ------    | ----   | ----          | ----        |
| url       | string | null          | server receive file url |
| maxSize   | number | 5             | max file size in MB     |
| multiple  | bool   | true          | can select and upload multiple files |
| separate  | bool   | false         | upload multiple files in separate request  |
| file      | string | `file`        | the file key,when multiple is false |
| auto      | bool   | true          | upload file after selected automatically |
| allowExt  | array  | ['jpg','png','gif'] |  file type can be upload |
| before    | function | $.noop | before send ajax callback,can modify data here,received param config |
| success   | function | $.noop | success callback |
| error     | function | $.noop | error callback |
| always    | function | $.noop | request finished callback,no matter success or error |
| done      | function | $.noop | when all request is finished, useful in separate upload request |
| onprogress | function | null | upload process callback |
| data      |  object | null |   payload for ajax , server get from key `data` in POST  |
| dataType  |  string | 'json' | same as $.ajax dataType |
| processbar | bool | false | show process bar or not |
| processContainer | string | null | must set processContainer when use processbar |
| startBtn  | string | null  | must set startBtn when auto is false |
| destroy   | bool   | false | destroy uploader once upload success |
| typeError | string or function | `文件类型不允许!`    | alert msg when type not allow        |
| sizeError | string or function | `超过XXMB,无法上传!` | alert msg when more than maxSize,use `XX` mean `maxSize` |

## usage

```
var uploader=$('.btn').uploadFile(
{
	url:'....',
	data:'...',
	success:function()
	{

	},
	error:function()
	{

	}
});

console.log(uploader);

uploader.destroy(); // destroy it
```

init it twice , no problem , you will got a false rather than an object.


### description

you can send data use the `data` key, data will be found in the  POST and is formated in json

when multiple is true , you can get all filelist in POST use the key `filelist` , which looks like `file0,file1,file2`

if multiple is false , your file would be post as key `file` which can be modified in the config `file`

when separate is true

```
before:function(config,index,item)
{
	//index is the filelist index
	//item is the file item
},
```

when separate is flase

```
before:function(config,filelist)
{
	//only get 2 params
},
```

```
before:function(config,index,item)
{
	config.fd.append('key','post value ');
	//can get all config in the config , but should not modify some important key
},
```

git clone and see demo in index.html






