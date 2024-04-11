const axios = require("axios");
const path = require("path");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// 视频号类型
class VideoId {
    ID;
    isBV;
    isAV;
    isValid;

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

// 判断视频号类型
const is_av_or_Bv = (str) => {
    // more like videoID parser
    const reg = /^((BV[a-zA-Z0-9]{10})|(av[0-9]{1,20}))(\?p=[0-9]{1,3})?/;
    const match = str.match(reg);
    const res = new VideoId(str);
    if (!match) {
        res.change_to_invalid();
    } else {
        const split = match[0].split("?p=");
        if (split.length > 1) {
            res.set_page(Number(split[1]));
            res.ID = split[0];
        }
        if (split[0].startsWith("a")) {
            res.change_to_AV();
        } else if (split[0].startsWith("B")) {
            res.change_to_BV();
        }
    }
    return res;
};

// 获取视频信息
const get_video_info = (arg) => {
    return new Promise((resolve, reject) => {
        let videoId;
        if (typeof arg === "string") {
            videoId = is_av_or_Bv(arg);
        } else if (
            typeof arg === "object" &&
            arg.constructor.name === "VideoId"
        ) {
            videoId = arg;
        }
        if (!videoId || videoId.isValid) {
            reject("参数错误");
        }
        let infoUrl = "https://api.bilibili.com/x/web-interface/view?";
        if (videoId.isBV) {
            infoUrl = infoUrl + `bvid=${videoId.ID}`;
        } else if (videoId.isAV) {
            infoUrl = infoUrl + `aid=${cut_av_id(videoId.ID)}`;
        }
        axios(infoUrl)
            .then((res) => {
                if (res.data.code === 0) {
                    const payload = {};
                    payload.cid = res.data.data.pages[videoId.page - 1].cid;
                    payload.part = res.data.data.pages[videoId.page - 1].part;
                    payload.title = res.data.data.title;
                    payload.title +=
                        res.data.data.videos > 1 ?
                        `-第${videoId.page}分P-${payload.part}` :
                        "";
                    payload.bvid = res.data.data.bvid;
                    payload.aid = res.data.data.aid;
                    // console.log(payload);
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

// 截取av号数字
const cut_av_id = (avId) => {
    const AVReg = /[0-9]+/;
    return avId.match(AVReg)[0];
};

// 获取视频下载链接
const get_download_url = (videoInfo, pages) => {
    return new Promise((resolve, reject) => {
        const avid = videoInfo.aid;
        const cid = videoInfo.cid;
        let url = `http://api.bilibili.com/x/player/playurl?avid=${avid}&cid=${cid}&fnval=16`;
        axios(url).then((res) => {
            resolve(res.data.data);
        });
    });
};

// 下载视频流
const download_video_stream = (url) => {
    return new Promise((resolve, reject) => {
        console.log("视频流下载中");
        axios({
            url: url,
            method: "get",
            responseType: "stream",
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                origin: "https: //www.bilibili.com",
                referer: "https://www.bilibili.com",
                "X-Real-ip": "116.17.41.11",
            },
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

// 下载音频流
const download_audio_stream = (url) => {
    return new Promise((resolve, reject) => {
        console.log("音频流下载中");
        axios({
            url: url,
            method: "get",
            responseType: "stream",
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                origin: "https: //www.bilibili.com",
                referer: "https://www.bilibili.com",
                "X-Real-ip": "116.17.41.11",
            },
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

// 合并视频音频流
const marge_stream = (videoPath, audioPath, videoName) => {
    console.log("合并视频流音频流中");
    return new Promise((resolve, reject) => {
        let tmpPath = path.resolve(
            __dirname,
            `../media/${new Date().getTime()}.mp4`
        );
        let outputPath = path.resolve(__dirname, `../media/${videoName}.mp4`);
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

// 下载视频
const download_video = (str) => {
    return new Promise((resolve, reject) => {
        let videoInfo;
        let videoStreams;
        let audioStreams;
        let videoStreamPath;
        let audioStreamPath;
        get_video_info(str)
            .then((res) => {
                videoInfo = res;
                return get_download_url(videoInfo);
            })
            .then((res) => {
                videoStreams = res.dash.video;
                audioStreams = res.dash.audio;
                return download_video_stream(
                    get_clarity(videoStreams),
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
                    videoInfo.title
                );
            })
            .then((res) => {
                resolve(res);
            });
    });
};

// 下载音频
const download_audio = (str) => {
    return new Promise((resolve, reject) => {
        let videoInfo;
        let audioStreams;
        let audioStreamPath;
        get_video_info(str)
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
                    __dirname,
                    `../media/${videoInfo.bvid}.mp3`
                );
                fs.renameSync(audioStreamPath, outputPath);
                resolve(outputPath);
            });
    });
};

// 删除文件
const delete_file = (path) => {
    fs.unlink(path, () => {});
};

// 获取某个清晰度的下载链接，默认360P
const get_clarity = (videoStreams, definitionId = 32) => {
    for (let i = 0; i < videoStreams.length; i++) {
        if (videoStreams[i].id === definitionId) {
            return videoStreams[i].baseUrl;
        }
    }
    throw new Error("此视频没有对应的清晰度");
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
};