const bili = require("./modules/bili.js");
const strings = ["BV1uq4y1e7ZY"];

// strings.forEach(str => {
//     bili.download_video(str)
//         .then((res) => {
//             console.log(res);
//         })
// });


strings.forEach(str => {
    bili.download_audio(str)
        .then((res) => {
            console.log(res);
        })
});