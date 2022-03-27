const bili = require("./modules/bili.js");
const strings = ["V1bR4y1V7QJ"];

strings.forEach(str => {
    bili.download_video(str)
        .then((res) => {
            console.log(res);
        })
});