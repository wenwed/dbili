const dbili = require("./index.js");
const strings1 = ["BV1uq4y1e7ZY"];
const strings2 = ["BV1hT4y1v7Vg?p=2"];
// const strings = ["BV1uq4y1e7ZY"];

strings1.forEach(str => {
    dbili.download_video(str)
        .then((res) => {
            console.log(res);
        })
});

strings2.forEach(str => {
    dbili.download_video(str)
        .then((res) => {
            console.log(res);
        })
});


// 清晰度键值
// {
//     "360p": 16,
//     "480p": 32,
//     "720p": 64,
//     "720p60": 74,
//     "1080p": 80,
//     "1080p+": 112,
//     "1080p60": 116
// }

// dbili.download_bangumi("骸骨骑士大人奇幻世界", dbili.bangumiDefinition["1080p"]);

// let cookie = ["SESSDATA=d7a2363a%2C1672752204%2C73e9e%2A71; 546464",
//     "bili_jct=d0c4e80d5febf5f5070a0a9c72abdb89; 465465456152 45",
//     "DedeUserID=147715383; 35454gdf5fd4g 54534d",
//     "DedeUserID__ckMd5=436c6c96b076909f; ",
//     "sid=540wk0go; 2454 21454 "
// ];

// console.log(dbili.cast_cookie_to_Str(cookie));