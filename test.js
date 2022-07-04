const bili = require("./index.js");
// const strings = ["BV1uq4y1e7ZY", "BV1TZ4y1k7Bm"];

// strings.forEach(str => {
//     bili.download_video(str)
//         .then((res) => {
//             console.log(res);
//         })
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

bili.download_bangumi("邻家索菲", bili.bangumiDefinition["720p"]);