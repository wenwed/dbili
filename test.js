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

// dbili.get_cookie().then(() => {
//     dbili.download_bangumi("路人女主的养成方法", dbili.DEFINITION["1080p"]);
// });
// dbili.download_bangumi("路人女主的养成方法", dbili.DEFINITION["1080p"]);
dbili.get_cookie().then(() => {
    dbili.download_bangumi("路人女主的养成方法", dbili.DEFINITION["1080p"]);
    // dbili.download_video("BV1Fr421V7TH", dbili.DEFINITION["1080p"], 1);
});
