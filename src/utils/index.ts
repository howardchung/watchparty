//@ts-ignore
import canAutoplay from 'can-autoplay';
import { v4 as uuidv4 } from 'uuid';
import { MD5 } from './md5';
import firebase from 'firebase/compat/app';
import { XMLParser } from 'fast-xml-parser';
import config from '../config';

export function formatTimestamp(input: any, wallClock?: boolean): string {
  if (
    input === null ||
    input === undefined ||
    input === false ||
    Number.isNaN(input) ||
    input === Infinity
  ) {
    return '';
  }
  if (Number(input) >= Number.MAX_SAFE_INTEGER) {
    return 'live';
  }
  if (wallClock) {
    return new Date(input * 1000).toLocaleTimeString();
  }
  let hours = Math.floor(Number(input) / 3600);
  let minutes = (Math.floor(Number(input) / 60) % 60)
    .toString()
    .padStart(2, '0');
  let seconds = Math.floor(Number(input) % 60)
    .toString()
    .padStart(2, '0');
  return `${hours ? `${hours}:` : ''}${minutes}:${seconds}`;
}

export function formatSpeed(input: number) {
  if (input >= 1000000) {
    return (input / 1000000).toFixed(2) + ' MB/s';
  }
  if (input >= 1000) {
    return (input / 1000).toFixed(0) + ' KB/s';
  }
  return input + ' B/s';
}

export function formatSize(input: number) {
  if (input >= 1000000000) {
    return (input / 1000000000).toFixed(2) + ' GB';
  }
  if (input >= 1000000) {
    return (input / 1000000).toFixed(2) + ' MB';
  }
  if (input >= 1000) {
    return (input / 1000).toFixed(0) + ' KB';
  }
  return input + ' B';
}

export function hashString(input: string) {
  var hash = 0;
  for (var i = 0; i < input.length; i++) {
    var charCode = input.charCodeAt(i);
    hash += charCode;
  }
  return hash;
}

export const colorMappings: StringDict = {
  red: 'B03060',
  orange: 'FE9A76',
  yellow: 'FFD700',
  olive: '32CD32',
  green: '016936',
  teal: '008080',
  blue: '0E6EB8',
  violet: 'EE82EE',
  purple: 'B413EC',
  pink: 'FF1493',
  brown: 'A52A2A',
  grey: 'A0A0A0',
  black: '000000',
};

let colorCache = {} as NumberDict;
export function getColorForString(id: string) {
  let colors = [
    'red',
    'orange',
    'yellow',
    'olive',
    'green',
    'teal',
    'blue',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
  ];
  if (colorCache[id]) {
    return colors[colorCache[id]];
  }
  colorCache[id] = Math.abs(hashString(id)) % colors.length;
  return colors[colorCache[id]];
}

export function getColorForStringHex(id: string) {
  return colorMappings[getColorForString(id)];
}

export const getFbPhoto = (fbId: string) =>
  `https://graph.facebook.com/${fbId}/picture?type=normal`;

export const isYouTube = (input: string) => {
  return (
    input.startsWith('https://www.youtube.com/') ||
    input.startsWith('https://youtu.be/')
  );
};

export const isHttp = (input: string) => {
  return input.startsWith('http');
};

export const isMagnet = (input: string) => {
  return input.startsWith('magnet:');
};

export const isHls = (input: string) => {
  return input.includes('.m3u8');
};

export const isDash = (input: string) => {
  return input.includes('.mpd');
};

export const isScreenShare = (input: string) => {
  return input.startsWith('screenshare://');
};

export const isFileShare = (input: string) => {
  return input.startsWith('fileshare://');
};

export const isVBrowser = (input: string) => {
  return input.startsWith('vbrowser://');
};

export async function testAutoplay() {
  const result = await canAutoplay.video();
  return result.result;
}

export function decodeEntities(input: string) {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func: Function, wait: number, immediate?: boolean) {
  var timeout: any;

  // This is the function that is actually executed when
  // the DOM event is triggered.
  return function executedFunction() {
    // Store the context of this and any
    // parameters passed to executedFunction
    //@ts-ignore
    var context = this;
    var args = arguments;

    // The function to be called after
    // the debounce time has elapsed
    var later = function () {
      // null timeout to indicate the debounce ended
      timeout = null;

      // Call function now if you did not on the leading end
      if (!immediate) func.apply(context, args);
    };

    // Determine if you should call the function
    // on the leading or trail end
    var callNow = immediate && !timeout;

    // This will reset the waiting every function execution.
    // This is the step that prevents the function from
    // being executed because it will never reach the
    // inside of the previous setTimeout
    clearTimeout(timeout);

    // Restart the debounce waiting period.
    // setTimeout returns a truthy value (it differs in web vs node)
    timeout = setTimeout(later, wait);

    // Call immediately if you're dong a leading
    // end execution
    if (callNow) func.apply(context, args);
  };
}

export const getDefaultPicture = (name: string, background = 'a0a0a0') => {
  return `https://ui-avatars.com/api/?name=${name}&background=${background}&size=256&color=ffffff`;
};

export const isMobile = () => {
  return window.screen.width <= 600;
};

export function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export const iceServers = () => [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:5.161.49.183:3478',
    username: 'username',
    credential: 'password',
  },
  {
    urls: 'turn:135.181.147.65:3478',
    username: 'username',
    credential: 'password',
  },
  {
    urls: 'turn:5.78.83.26:3478',
    username: 'username',
    credential: 'password',
  },
    {
    urls: 'turn:5.223.48.157:3478',
    username: 'username',
    credential: 'password',
  },
  // {
  //   urls: 'turn:numb.viagenie.ca',
  //   credential: 'watchparty',
  //   username: 'howardzchung@gmail.com',
  // },
];

export const serverPath =
  config.VITE_SERVER_HOST ||
  `${window.location.protocol}//${
    config.NODE_ENV === 'development'
      ? `${window.location.hostname}:8080`
      : window.location.host
  }`;

export async function getMediaPathResults(
  mediaPath: string,
  query: string,
): Promise<SearchResult[]> {
  let results: SearchResult[] = [];
  if (mediaPath.includes('s3.')) {
    const response = await window.fetch(mediaPath);
    // S3-style buckets return data in XML
    const xml = await response.text();
    const parser = new XMLParser();
    const data = parser.parse(xml);
    let filtered = data.ListBucketResult.Contents.filter(
      // Exclude subdirectories
      (file: any) => !file.Key.includes('/'),
    );
    results = filtered.map((file: any) => ({
      url: mediaPath + '/' + file.Key,
      name: mediaPath + '/' + file.Key,
    }));
  } else if (mediaPath.startsWith('https://www.youtube.com/playlist?list=')) {
    // https://www.youtube.com/playlist?list=<playlist ID>
    const playlistID = mediaPath.split(
      'https://www.youtube.com/playlist?list=',
    )[1];
    const response = await window.fetch(
      serverPath + '/youtubePlaylist/' + playlistID,
    );
    results = await response.json();
  } else {
    // Assume it's a text list of URLs
    const response = await window.fetch(mediaPath);
    const text = await response.text();
    results = text
      .split('\n')
      .map((line) => ({ url: line, name: line, duration: 0, type: 'file' }));
  }
  return results.filter((res) => res.url);
}

export async function getStreamPathResults(
  streamPath: string,
  query: string,
): Promise<SearchResult[]> {
  const response = await window.fetch(
    streamPath + `/${query ? 'search' : 'top'}?q=` + encodeURIComponent(query),
  );
  const data = await response.json();
  return data;
}

export async function getYouTubeResults(
  query: string,
): Promise<SearchResult[]> {
  const response = await window.fetch(
    serverPath + '/youtube?q=' + encodeURIComponent(query),
  );
  const data = await response.json();
  return data.map((d: any) => ({ ...d, type: 'youtube' }));
}

export async function openFileSelector(accept?: string) {
  return new Promise<FileList | null>((resolve) => {
    // Create an input element
    const inputElement = document.createElement('input');

    // Set its type to file
    inputElement.type = 'file';

    // Set accept to the file types you want the user to select.
    // Include both the file extension and the mime type
    if (accept) {
      inputElement.accept = accept;
    }

    // set onchange event to call callback when user has selected file
    inputElement.addEventListener('change', () => {
      resolve(inputElement.files);
    });

    // dispatch a click event to open the file dialog
    inputElement.dispatchEvent(new MouseEvent('click'));
  });
}

export function getAndSaveClientId() {
  let clientId = window.localStorage.getItem('watchparty-clientid');
  if (!clientId) {
    // Generate a new clientID and save it
    clientId = uuidv4();
    window.localStorage.setItem('watchparty-clientid', clientId);
  }
  return clientId;
}

export function calculateMedian(array: number[]): number {
  // Check If Data Exists
  if (array.length >= 1) {
    // Sort Array
    array = array.sort((a: number, b: number) => {
      return a - b;
    });

    // Array Length: Even
    if (array.length % 2 === 0) {
      // Average Of Two Middle Numbers
      return (array[array.length / 2 - 1] + array[array.length / 2]) / 2;
    }
    // Array Length: Odd
    else {
      // Middle Number
      return array[(array.length - 1) / 2];
    }
  }
  return 0;
}

export async function getUserImage(
  user: firebase.User,
): Promise<string | null> {
  // Check if user has a Gravatar
  const hash = user.email ? MD5.hash(user.email) : '';
  if (user.email) {
    const gravatar = `https://www.gravatar.com/avatar/${hash}?d=404&s=256`;
    const response = await window.fetch(gravatar);
    if (response.ok) {
      return gravatar;
    }
  }
  if (user.photoURL) {
    return user.photoURL + '?height=256&width=256';
  }
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

export const getFileName = (input: string) => {
  return input.split('/').slice(-1)[0];
};

export const isEmojiString = (input: string): boolean => {
  return /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/g.test(
    input,
  );
};
