const downloadVideo = require("./modules/downloadVideo.js");
const bangumi = require("./modules/bangumi.js");

module.exports = {
    is_av_or_Bv: downloadVideo.is_av_or_Bv,
    get_video_info: downloadVideo.get_video_info,
    get_download_url: downloadVideo.get_download_url,
    download_video: downloadVideo.download_video,
    marge_stream: downloadVideo.marge_stream,
    download_audio: downloadVideo.download_audio,
    get_clarity: downloadVideo.get_clarity,
    get_bangumi_by_name: bangumi.get_bangumi_by_name,
    download_bangumi: bangumi.download_bangumi,
    bangumiDefinition: bangumi.bangumiDefinition,
}