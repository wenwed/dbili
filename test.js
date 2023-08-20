const axios = require("axios");
const dbili = require("./index.js");
// const strings = ["BV1T94y1X7uP"];

// strings.forEach((str) => {
//     dbili.download_video(str).then((res) => {
//         console.log(res);
//     });
// });

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

dbili.download_bangumi("路人女主的养成方法", dbili.bangumiDefinition["1080p"]);

// let cookie = ["SESSDATA=d7a2363a%2C1672752204%2C73e9e%2A71; 546464",
//     "bili_jct=d0c4e80d5febf5f5070a0a9c72abdb89; 465465456152 45",
//     "DedeUserID=147715383; 35454gdf5fd4g 54534d",
//     "DedeUserID__ckMd5=436c6c96b076909f; ",
//     "sid=540wk0go; 2454 21454 "
// ];

// console.log(dbili.cast_cookie_to_Str(cookie));

// // 下载视频所有分p
// const download_all_page = async(BV) => {
//     let url = `https://api.bilibili.com/x/player/pagelist?bvid=${BV}&jsonp=jsonp`;
//     let list = await axios(url)
//         .then((res) => {
//             return res.data.data;
//         })
//     for (let i = 1; i <= list.length; i++) {
//         let pageFile = await dbili.download_video(`${BV}?p=${i}`);
//         console.log(pageFile);
//     }
// }

// // 下载视频合集所有视频
// const download_all_collection = async(BV) => {
//     const INITIAL_STATE = /<script>window\.__INITIAL_STATE__=(.+);\(function\(\)\{var s;\(s=document\.currentScript\|\|document\.scripts\[document\.scripts\.length-1\]\)\.parentNode\.removeChild\(s\);\}\(\)\);<\/script>/;
//     let url = `https://www.bilibili.com/video/${BV}`;
//     let allVideoInfo = await axios(url)
//         .then((res) => {
//             let infoStr = res.data.match(INITIAL_STATE)[1];
//             let infoObj = JSON.parse(infoStr);
//             return infoObj.sectionsInfo.sections[0].episodes;
//         })
//     for (let i = 0; i < allVideoInfo.length; i++) {
//         let videoFile = await dbili.download_video(`av${allVideoInfo[i].aid}`);
//         console.log(videoFile);
//     }
// }

// download_all_collection("BV1T94y1X7uP");
