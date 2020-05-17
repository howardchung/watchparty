const Papa = require('papaparse');
const fs = require('fs');

const dataDir = '../j-archive-parser/j-archive-csv/';
const files = fs.readdirSync(dataDir);
let all = [];
files.forEach((file) => {
  const episode = fs.readFileSync(dataDir + file, 'utf-8');
  const output = Papa.parse(episode, { header: true });
  all = [...all, ...output.data];
});
console.log(all.length);
// Fix up the data format
all.forEach((row, i) => {
  if (!row.coord) {
    return;
  }
  const slice = row.coord.slice(1, row.coord.length - 1);
  all[i].xcoord = Number(slice.split(',')[0]);
  all[i].ycoord = Number(slice.split(',')[1]);
  all[i].daily_double = all[i].daily_double === 'True';
  // console.log(all[i].round_name);
  all[i].round_name = all[i].round_name.split(' ')[0].toLowerCase();
  // const valueSlice = row.value.slice(1, row.value.length - 1);
  // all[i].value = Number(valueSlice[0]);
  if (all[i].round_name === 'final') {
    all[i].value = 0;
  } else if (all[i].round_name === 'double') {
    all[i].value = all[i].ycoord * 400;
  } else {
    all[i].value = all[i].ycoord * 200;
  }
});
// Store a set of episode IDs, map to episode info
let output = {};
all.forEach((row) => {
  if (!row.epNum) {
    return;
  }
  if (!output[row.epNum]) {
    let info = undefined;
    if (/^\d{4} Teen Tournament/.test(row.extra_info)) {
      info = 'teen';
    } else if (/^\d{4} College Championship/.test(row.extra_info)) {
      info = 'college';
    } else if (/^\d{4} Kids Week/.test(row.extra_info)) {
      info = 'kids';
    } else if (/^\d{4} Celebrity/.test(row.extra_info)) {
      info = 'celebrity';
    } else if (/^\d{4} Teacher/.test(row.extra_info)) {
      info = 'teacher';
    } else if (/^\d{4} Tournament of Champions/.test(row.extra_info)) {
      info = 'champions';
    }
    if (info) {
      console.log(row.extra_info, info);
    }
    output[row.epNum] = {
      epNum: row.epNum,
      airDate: row.airDate,
      info,
      jeopardy: [],
      double: [],
      final: [],
    };
  }
  if (!output[row.epNum][row.round_name]) {
    console.log(row);
    return;
  }
  output[row.epNum][row.round_name].push({
    x: row.xcoord,
    y: row.ycoord,
    q: row.question,
    a: row.answer,
    cat: row.category,
    dd: row.daily_double,
    val: row.value,
  });
});
fs.writeFileSync('./jeopardy.json', JSON.stringify(output));
