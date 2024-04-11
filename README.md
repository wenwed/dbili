### 插件说明
可以下载b站视频，番剧

### 引用方式
```javascript
const dbili =  require("dbili/index.js");
```

### 使用示例
```javascript
const dbili =  require("dbili/index.js");
dbili.download_video("av114514")
  .then((videoPath) => {
    console.log(videoPath);
})

dbili.download_bangumi("邻家索菲", dbili.bangumiDefinition["720p"]);
```

### 参数说明


| 方法             | 说明                           | 参数   |
| ---------------- | ------------------------------ | ------ |
| download_video(videoStr) | 下载视频               | videoStr：av号或bv号，加分p（?p=xxx） |
| download_audio(videoStr) | 下载音频       | videoStr：av号或bv号，加分p（?p=xxx） |
| download_bangumi(bangumi, definition) | 下载番剧 | bangumi：番剧名称；definition：清晰度 |

### 特别
下载番剧时，部分番剧需要大会员。插件会自动弹出登录二维码，b站手机app扫码后就能继续下载。