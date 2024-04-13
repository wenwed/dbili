const downloadVideo = require("./modules/downloadVideo.js");
const bangumi = require("./modules/bangumi.js");
const login = require("./modules/login.js");
const { cookie } = require("request");

// 初始化cookie全局变量
global.dBiliHasCookie = false;
global.dBiliCookie = "";
global.dBiliHeader = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "zh-CN,zh;q=0.9,zh-TW;q=0.8",
    "Cache-Control": "max-age=0",
    "Sec-Ch-Ua": `"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"`,
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": `"Windows"`,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
};

module.exports = {
    is_av_or_Bv: downloadVideo.is_av_or_Bv,
    get_video_info: downloadVideo.get_video_info,
    get_download_url: downloadVideo.get_download_url,
    download_video: downloadVideo.download_video, // 使用bv号或av号下载视频
    marge_stream: downloadVideo.marge_stream,
    download_audio: downloadVideo.download_audio, // 使用bv号或av号下载音频
    get_clarity: downloadVideo.get_clarity,
    get_bangumi_by_name: bangumi.get_bangumi_by_name, // 使用番剧名称下载番剧
    download_bangumi: bangumi.download_bangumi,
    DEFINITION: downloadVideo.DEFINITION, // 番剧清晰度
    get_cookie: login.get_cookie,
    cast_cookie_to_Str: login.cast_cookie_to_Str,
};
