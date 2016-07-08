## jquery-uploadfile


**use jquery ajax upload multiple files in one request**

### config

| key       | type   | default value | description |
| ------    | ----   | ----          | ----        |
| url       | string | null          | server receive file url |
| maxSize   | number | 5             | max file size in MB     |
| multiple  | bool   | true          | can select and upload multiple |
| auto      | bool   | true          | upload file after selected automatically |
| allowExt  | array  | ['jpg','png','gif'] |  file type can be upload |
| before    | function | $.noop | before send ajax callback,can modify data here,received param config |
| success   | function | $.noop | success callback |
| error     | function | $.noop | error callback |
| always    | function | $.noop | request finished callback,no matter success or error |
| onprogress | function | null | upload process callback |
| data      |  object | null |   payload for ajax , server get from key `data` in POST  |
| dataType  |  string | 'json' | same as $.ajax dataType |
| processbar | bool | false | show process bar or not |
| processContainer | string | null | must set processContainer when use processbar |
| startBtn | string | null  | must set startBtn when auto is false |
| destroy  | bool   | false | destroy uploader once upload success |

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

you can get all filelist in POST use the key `filelist` , which looks like `file0,file1,file2`


git clone and see demo in index.html




