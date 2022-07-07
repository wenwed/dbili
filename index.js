const downloadVideo = require("./modules/downloadVideo.js");
const bangumi = require("./modules/bangumi.js");
const login = require("./modules/login.js");

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
    bangumiDefinition: bangumi.bangumiDefinition, // 番剧清晰度
    get_cookie: login.get_cookie,
    cast_cookie_to_Str: login.cast_cookie_to_Str,
}