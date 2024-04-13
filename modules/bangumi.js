const axios = require("axios");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const downloadVideo = require("./downloadVideo.js");
const login = require("./login.js");
const seasonIDHashTable = {};

// 下载番剧
const download_bangumi = async (
    nameStr,
    definition,
    folderPath = "./media"
) => {
    let bangumiInfo; // 番剧信息
    bangumiInfo = await get_bangumi_by_name(nameStr);
    const eps = bangumiInfo.episodes; // 所有的剧集
    for (let i = 0; i < eps.length; i++) {
        // for (let i = 0; i < 1; i++) {
        try {
            await download_one_ep(
                eps[i],
                seasonIDHashTable[nameStr],
                definition,
                folderPath
            );
        } catch (err) {
            console.log(err);
        }
    }
    console.log("下载完成");
};

// 通过名字查询番剧信息
const get_bangumi_by_name = (nameStr) => {
    return new Promise((resolve, reject) => {
        axios({
            url: encodeURI(
                `https://api.bilibili.com/x/web-interface/wbi/search/all/v2?__refresh__=true&_extra=&context=&page=1&page_size=42&order=&duration=&from_source=&from_spmid=333.337&keyword=${nameStr}`
            ),
            headers: global.dBiliHeader,
        })
            .then((res) => {
                if (
                    res.data &&
                    res.data.data &&
                    res.data.data.result.length > 0
                ) {
                    let media_bangumi = null;
                    for (let i = 0; i < res.data.data.result.length; i++) {
                        if (
                            res.data.data.result[i]["result_type"] ===
                            "media_bangumi"
                        ) {
                            media_bangumi = res.data.data.result[i]["data"];
                        }
                    }
                    if (media_bangumi === null) {
                        reject("没有番剧信息");
                    }
                    console.log(`下载番剧${media_bangumi[0].title}中...`);
                    seasonIDHashTable[nameStr] = media_bangumi[0].season_id;
                    return axios({
                        url: `https://api.bilibili.com/pgc/view/web/season?season_id=${media_bangumi[0].season_id}`,
                        headers: global.dBiliHeader,
                    });
                } else {
                    reject("没有番剧信息");
                }
            })
            .then((res) => {
                resolve(res.data.result);
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

// 下载单集番剧
const download_one_ep = (ep, seasonID, definition, folderPath) => {
    return new Promise((resolve, reject) => {
        let videoStreams;
        let aduioStreams;
        let videoStream;
        let aduioStream;
        let videoPath;
        let audioPath;
        console.log(`下载${ep.title}：${ep.long_title}中`);
        const headers = Object.assign(global.dBiliHeader);
        headers.Origin = "https://www.bilibili.com";
        headers.Referer = `https://www.bilibili.com/bangumi/play/ss${seasonID}?from_spmid=666.4.mylist.0`;
        set_headers(ep, definition) // 可能需要cookie，设置headers
            .then(() => {
                return axios({
                    url: `https://api.bilibili.com/pgc/player/web/playurl?support_multi_audio=true&bvid=${ep.bvid}&qn=80&fnver=0&epid=${ep.ep_id}&cid=${ep.cid}&fnval=4048&fourk=1&gaia_source=&from_client=BROWSER&is_main_page=true&need_fragment=true`,
                    headers: headers,
                });
            })
            .then((res) => {
                if (!res.data.result || !res.data.result.dash) {
                    throw new Error("权限不足");
                } else {
                    videoStreams = res.data.result.dash.video;
                    aduioStreams = res.data.result.dash.audio;
                    videoStream = downloadVideo.get_clarity(
                        videoStreams,
                        definition
                    ); // 获取视频下载链接
                    aduioStream = aduioStreams[0].baseUrl; // 获取音频下载链接
                    return downloadVideo.download_video_stream(videoStream);
                }
            })
            .then((res) => {
                videoPath = res;
                return downloadVideo.download_audio_stream(aduioStream);
            })
            .then((res) => {
                audioPath = res;
                return downloadVideo.marge_stream(
                    videoPath,
                    audioPath,
                    ep.long_title,
                    folderPath
                );
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    });
};

// 设置headers
const set_headers = (ep, definition) => {
    return new Promise((resolve, reject) => {
        if (
            (definition > 64 || ep.badge !== "") &&
            global.dBiliHasCookie === false
        ) {
            // 需要登录，拿cookie
            login
                .get_cookie()
                .then((cookie) => {
                    resolve(cookie);
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            resolve();
        }
    });
};

module.exports = {
    download_bangumi,
    get_bangumi_by_name,
};
