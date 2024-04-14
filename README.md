### 插件说明

可以下载 b 站视频，番剧

### 引用方式

```javascript
const dbili = require("dbili/index.js");
```

### 使用示例

```javascript
const dbili = require("dbili/index.js");
dbili
    .download_video("av114514", dbili.DEFINITION["720p"], 1, "./media")
    .then((videoPath) => {
        console.log(videoPath);
    });

dbili.download_bangumi("邻家索菲", dbili.bangumiDefinition["720p"]);
```

### 参数说明

| 方法                                  | 说明     | 参数                                                                                                                  |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| download_video(videoStr)              | 下载视频 | videoStr：av 号或 bv 号；definition:清晰度，类 DEFINITION 的值；page：分 p；folderPath：下载的文件夹，默认为"./media" |
| download_audio(videoStr)              | 下载音频 | ideoStr：av 号或 bv 号；definition:清晰度，类 DEFINITION 的值；page：分 p；folderPath：下载的文件夹，默认为"./media"  |
| download_bangumi(bangumi, definition) | 下载番剧 | bangumi：番剧名称；definition：清晰度                                                                                 |
| get_cookie()                          | 获取权限 |                                                                                                                       |

### 特别

下载需要无权限的视频时，需要设置 cookie。调用获取权限方法后会启动服务器，访问网址并扫码后，插件会自动设置 cookie，即可下载需要权限的视频。
