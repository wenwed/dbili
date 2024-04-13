const axios = require("axios");
const http = require("http");
const request = require("request"); // axios不能拿到b站响应设置的set-cookie，故使用request
const qrcode = require("qr-image");
const { clearInterval } = require("timers");
const cp = require("child_process");

let server;

// headers
const headers = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
    origin: "https://www.bilibili.com",
    referer: "https://www.bilibili.com",
};

/**
 * 请求登录二维码key
 * @returns 登录二维码key
 */
const get_oauth_key = () => {
    return axios({
        url: "https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main_mini",
        headers: headers,
    }).then((res) => {
        return res.data.data.qrcode_key;
    });
};

/**
 * 启动服务器展示登录二维码
 * @param {*} oauthKey 登录二维码key
 */
const show_qr_code = (oauthKey) => {
    server = http.createServer((req, res) => {
        var code = qrcode.image(
            // `https://passport.bilibili.com/qrcode/h5/login?oauthKey=${oauthKey}`,
            `https://passport.bilibili.com/h5-app/passport/login/scan?&qrcode_key=${oauthKey}&from=main_mini`,
            { type: "png" }
        );
        res.setHeader("Content-type", "image/png"); //sent qr image to client side
        code.pipe(res);
    });

    server.listen(11451, () => {
        console.log("浏览器访问：http://127.0.0.1:11451 扫码登录");
        // cp.exec("start http://127.0.0.1:11451"); // windows系统启动浏览器
    });
};

/**
 * 获取登录cookie
 * @returns
 */
const get_cookie = () => {
    let oauthKey;
    let clock; // 时钟
    let lock = false; // 锁
    let count = 0;
    return new Promise((resolve, reject) => {
        // 获取oauthkey创建服务器扫码
        get_oauth_key().then((res) => {
            oauthKey = res;
            show_qr_code(oauthKey);
        });
        // 每三秒检查一次有没有扫码
        clock = setInterval(() => {
            count++;
            if (count >= 180 / 3) {
                // 超时
                clearInterval(clock);
                lock = false;
                server.close();
                console.log("扫码超时，服务器已关闭");
                reject();
            } else if (lock === false) {
                lock = true;
                request.get(
                    {
                        url: `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${oauthKey}&source=main_mini`,
                    },
                    (err, res, body) => {
                        const data = JSON.parse(body);
                        if (data.data.code === 0) {
                            let cookie = res.headers["set-cookie"];
                            let cookieStr = cast_cookie_to_Str(cookie);
                            clearInterval(clock);
                            lock = false;
                            server.close();
                            global.dBiliCookie = cookieStr;
                            global.dBiliHasCookie = true;
                            global.dBiliHeader.cookie = cookieStr;
                            resolve(cookieStr);
                        } else {
                            lock = false;
                        }
                    }
                );
            }
        }, 3000);
    });
};

/**
 * 将获取的cookie转为字符串
 * @param {*} cookie
 * @returns
 */
const cast_cookie_to_Str = (cookie) => {
    let res = "";
    for (let i = 0; i < cookie.length; i++) {
        let tmp = cookie[i].split(" ");
        res = res + tmp[0] + " ";
    }
    return res;
};

module.exports = {
    get_cookie,
    cast_cookie_to_Str,
};
