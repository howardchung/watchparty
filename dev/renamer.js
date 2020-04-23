const fs = require('fs');
const xml2js = require('xml2js');

const xml = ``;

init();

async function init() {
  const subPath = '/var/www/html/subtitles/';
  const subs = fs.readdirSync(subPath);
  let vids = fs.readdirSync('/var/www/html/');
  const data = await xml2js.parseStringPromise(xml);
  // vids = [...data.ListBucketResult.Contents.filter(file => file.Key[0].startsWith('')).map(file => file.Key[0])];
  console.log(subs);
  console.log(vids);
  vids.forEach((vid) => {
    const match = subs.find((sub) =>
      vid.toLowerCase().startsWith(sub.slice(0, -4).toLowerCase())
    );
    console.log(vid, match);
    if (vid && match) {
      fs.copyFileSync(subPath + match, subPath + vid + '.srt');
    }
  });
}
