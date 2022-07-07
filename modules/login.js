const axios = require("axios");
const http = require("http");
const request = require("request"); // axios不能拿到b站响应设置的set-cookie，故使用request
const qrcode = require("qr-image");
const { clearInterval } = require("timers");
const cp = require("child_process");

let server;

// 请求登录key
const get_oauth_key = () => {
    return axios("http://passport.bilibili.com/qrcode/getLoginUrl")
        .then((res) => {
            return res.data.data.oauthKey;
        })
}

// 启动服务器展示二维码
const show_qr_code = (oauthKey) => {
    server = http.createServer((req, res) => {
        var code = qrcode.image(`https://passport.bilibili.com/qrcode/h5/login?oauthKey=${oauthKey}`, { type: 'png' })
        res.setHeader('Content-type', 'image/png'); //sent qr image to client side
        code.pipe(res);
    })

    server.listen(11451, () => {
        console.log('浏览器访问：http://127.0.0.1:11451 扫码登录');
        cp.exec("start http://127.0.0.1:11451");
    });
}

// 获取cookie
const get_cookie = () => {
    let oauthKey;
    let clock; // 时钟
    let lock = false; // 锁
    let count = 0;
    return new Promise((resolve, reject) => {
        // 获取oauthkey创建服务器扫码
        get_oauth_key()
            .then((res) => {
                oauthKey = res;
                show_qr_code(oauthKey);
            })
            // 每三秒检查一次有没有扫码
        clock = setInterval(() => {
            count++;
            if (count >= 180 / 3) { // 超时
                clearInterval(clock);
                lock = false;
                server.close();
                console.log("扫码超时，服务器已关闭");
                reject();
            } else if (lock === false) {
                lock = true;
                request.post({
                    url: "http://passport.bilibili.com/qrcode/getLoginInfo",
                    form: { oauthKey }
                }, (err, res, body) => {
                    const data = JSON.parse(body);
                    if (data.status === true) {
                        let cookie = res.headers["set-cookie"];
                        let cookieStr = cast_cookie_to_Str(cookie);
                        clearInterval(clock);
                        lock = false;
                        server.close();
                        resolve(cookieStr);
                    } else {
                        lock = false;
                    }
                })
            }
        }, 3000);
    })
}

// 将获取的cookie转为字符串
const cast_cookie_to_Str = (cookie) => {
    let res = "";
    for (let i = 0; i < cookie.length; i++) {
        let tmp = cookie[i].split(" ");
        res = res + tmp[0] + " ";
    }
    return res;
}

module.exports = {
    get_cookie,
    cast_cookie_to_Str
}