const axios = require("axios");
const path = require("path");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// 清晰度
const DEFINITION = Object.freeze({
    "360p": 16,
    "480p": 32,
    "720p": 64,
    "720p60": 74,
    "1080p": 80,
    "1080p+": 112,
    "1080p60": 116,
});

/**
 * 视频信息类
 */
class VideoInfo {
    ID; // 传入值
    isBV; // 是否为BV号
    isAV; // 是否为AV号
    isValid; // 是否不是BV/AV号
    page; // 第几分p

    constructor(str) {
        this.ID = str;
        this.page = 1;
        this.isBV = false;
        this.isAV = false;
        this.isValid = false;
    }

    change_to_BV() {
        this.isBV = true;
        this.isAV = false;
        this.isValid = false;
    }

    change_to_AV() {
        this.isBV = false;
        this.isAV = true;
        this.isValid = false;
    }

    change_to_invalid() {
        this.isBV = false;
        this.isAV = false;
        this.isValid = true;
    }

    set_page(p) {
        this.page = p;
    }
}

/**
 * 判断视频号类型
 * @param {*} str AV/BV号
 * @param {*} page 分p
 * @returns
 */
const is_av_or_Bv = (str, page) => {
    // more like VideoInfo parser
    const reg = /^((BV[a-zA-Z0-9]{10})|(av[0-9]{1,20}))/;
    const match = str.match(reg);
    const res = new VideoInfo(str);
    if (!match) {
        res.change_to_invalid();
    } else {
        res.set_page(page);
        if (str.startsWith("a")) {
            res.change_to_AV();
        } else if (str.startsWith("B")) {
            res.change_to_BV();
        }
    }
    return res;
};

/**
 * 获取视频信息
 * @param {*} arg  BV/AV号字符串，或类VideoInfo的实例
 * @param {*} page 分p
 * @returns
 */
const get_video_info = (arg, page) => {
    return new Promise((resolve, reject) => {
        let VideoInfo;
        if (typeof arg === "string") {
            VideoInfo = is_av_or_Bv(arg, page);
        } else if (
            typeof arg === "object" &&
            arg.constructor.name === "VideoInfo"
        ) {
            VideoInfo = arg;
        }
        if (!VideoInfo || VideoInfo.isValid) {
            reject("参数错误");
        }
        let infoUrl = "https://api.bilibili.com/x/web-interface/view?";
        if (VideoInfo.isBV) {
            infoUrl = infoUrl + `bvid=${VideoInfo.ID}`;
        } else if (VideoInfo.isAV) {
            infoUrl = infoUrl + `aid=${cut_av_id(VideoInfo.ID)}`;
        }
        axios(infoUrl)
            .then((res) => {
                if (res.data.code === 0) {
                    const payload = {};
                    payload.cid = res.data.data.pages[VideoInfo.page - 1].cid;
                    payload.part = res.data.data.pages[VideoInfo.page - 1].part;
                    payload.title = res.data.data.title;
                    payload.title +=
                        res.data.data.videos > 1
                            ? `-第${VideoInfo.page}分P-${payload.part}`
                            : "";
                    payload.bvid = res.data.data.bvid;
                    payload.aid = res.data.data.aid;
                    resolve(payload);
                } else {
                    reject(dat.message);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

/**
 * 截取av号数字
 * @param {*} avId  AV号
 * @returns
 */
const cut_av_id = (avId) => {
    const AVReg = /[0-9]+/;
    return avId.match(AVReg)[0];
};

/**
 * 获取视频下载链接
 * @param {*} videoInfo 视频信息
 * @returns
 */
const get_download_url = (videoInfo) => {
    return new Promise((resolve, reject) => {
        const avid = videoInfo.aid;
        const cid = videoInfo.cid;
        let url = `http://api.bilibili.com/x/player/playurl?avid=${avid}&cid=${cid}&fnval=16`;
        axios({
            url,
            method: "get",
            headers: global.dBiliHeader,
        }).then((res) => {
            resolve(res.data.data);
        });
    });
};

/**
 * 下载视频流
 * @param {*} url 视频流地址
 * @returns
 */
const download_video_stream = (url, videoInfo) => {
    return new Promise((resolve, reject) => {
        console.log("视频流下载中");
        const headers = Object.assign(global.dBiliHeader);
        headers.Origin = "https://www.bilibili.com";
        if (typeof videoInfo !== "undefined") {
            headers.Referer = `https://www.bilibili.com/video/${videoInfo.str}`;
        }
        axios({
            url: url,
            method: "get",
            responseType: "stream",
            headers: headers,
        }).then((res) => {
            const filePath = path.resolve(
                __dirname,
                `../tmp/${new Date().getTime()}.mp4`
            );
            const writer = fs.createWriteStream(filePath);
            res.data.pipe(writer);
            writer.on("finish", () => {
                console.log("视频流下载成功");
                resolve(filePath);
            });
            writer.on("error", (err) => {});
        });
    });
};

/**
 * 下载音频流
 * @param {*} url 音频流地址
 * @returns
 */
const download_audio_stream = (url, videoInfo) => {
    return new Promise((resolve, reject) => {
        console.log("音频流下载中");
        const headers = Object.assign(global.dBiliHeader);
        headers.Origin = "https://www.bilibili.com";
        if (typeof videoInfo !== "undefined") {
            headers.Referer = `https://www.bilibili.com/video/${videoInfo.str}`;
        }
        axios({
            url: url,
            method: "get",
            responseType: "stream",
            headers: headers,
        }).then((res) => {
            const filePath = path.resolve(
                __dirname,
                `../tmp/${new Date().getTime()}.mp3`
            );
            const writer = fs.createWriteStream(filePath);
            res.data.pipe(writer);
            writer.on("finish", () => {
                console.log("音频流下载成功");
                resolve(filePath);
            });
            writer.on("error", (err) => {});
        });
    });
};

/**
 * 合并视频音频流
 * @param {*} videoPath 视频地址
 * @param {*} audioPath 音频地址
 * @param {*} videoName 视频名称
 * @param {*} folderPath 下载地址
 * @returns
 */
const marge_stream = (videoPath, audioPath, videoName, folderPath) => {
    console.log("合并视频流音频流中");
    return new Promise((resolve, reject) => {
        let tmpPath = path.resolve(folderPath, `${new Date().getTime()}.mp4`);
        let outputPath = path.resolve(folderPath, `${videoName}.mp4`);

        ffmpeg(videoPath)
            .mergeAdd(audioPath)
            .on("end", (stdout, stderr) => {
                console.log("下载完成");
                delete_file(videoPath); // 删掉视频流地址
                delete_file(audioPath); // 删掉音频流地址
                fs.renameSync(tmpPath, outputPath);
                resolve(outputPath);
            })
            .save(tmpPath);
    });
};

/**
 * 下载B站视频
 * @param {*} str BV/AV号
 * @param {*} definition 清晰度
 * @param {*} page 分p
 * @param {*} folderPath 地址
 * @returns
 */
const download_video = (str, definition, page, folderPath = "./media") => {
    return new Promise((resolve, reject) => {
        let videoInfo;
        let videoStreams;
        let audioStreams;
        let videoStreamPath;
        let audioStreamPath;
        get_video_info(str, page)
            .then((res) => {
                videoInfo = res;
                return get_download_url(videoInfo);
            })
            .then((res) => {
                videoStreams = res.dash.video;
                audioStreams = res.dash.audio;
                return download_video_stream(
                    get_clarity(videoStreams, definition),
                    videoInfo
                );
                // return download_video_stream(videoStreams[0].baseUrl, videoInfo);
            })
            .then((res) => {
                videoStreamPath = res;
                // return download_audio_stream(audioStreams[audioStreams.length - 1].baseUrl, videoInfo);
                return download_audio_stream(
                    audioStreams[0].baseUrl,
                    videoInfo
                );
            })
            .then((res) => {
                audioStreamPath = res;
                return marge_stream(
                    videoStreamPath,
                    audioStreamPath,
                    videoInfo.title,
                    folderPath
                );
            })
            .then((res) => {
                resolve(res);
            });
    });
};

/**
 * 下载音频
 * @param {*} str BV/AV号
 * @param {*} page 分p
 * @param {*} folderPath 下载地址
 * @returns
 */
const download_audio = (str, page, folderPath) => {
    return new Promise((resolve, reject) => {
        let videoInfo;
        let audioStreams;
        let audioStreamPath;
        get_video_info(str, page)
            .then((res) => {
                videoInfo = res;
                return get_download_url(videoInfo);
            })
            .then((res) => {
                audioStreams = res.dash.audio;
                return download_audio_stream(
                    audioStreams[0].baseUrl,
                    videoInfo
                );
            })
            .then((res) => {
                audioStreamPath = res;
                let outputPath = path.resolve(
                    folderPath,
                    `${videoInfo.bvid}.mp3`
                );
                fs.renameSync(audioStreamPath, outputPath);
                resolve(outputPath);
            });
    });
};

// 删除文件
const delete_file = (folderPath) => {
    fs.unlink(folderPath, () => {});
};

// 获取某个清晰度的下载链接，默认360P
const get_clarity = (videoStreams, definitionId = 32) => {
    for (let i = 0; i < videoStreams.length; i++) {
        if (videoStreams[i].id === definitionId) {
            return videoStreams[i].baseUrl;
        }
    }
    throw new Error(
        "此视频没有对应的清晰度，如果是会员专属视频则需要登录再尝试下载"
    );
};

module.exports = {
    is_av_or_Bv,
    get_video_info,
    get_download_url,
    download_video,
    marge_stream,
    download_audio,
    get_clarity,
    download_video_stream,
    download_audio_stream,
    DEFINITION,
};
