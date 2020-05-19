//@ts-ignore
import canAutoplay from 'can-autoplay';

export function formatTimestamp(input: any) {
  if (
    input === null ||
    input === undefined ||
    input === false ||
    Number.isNaN(input) ||
    input === Infinity
  ) {
    return '';
  }
  let minutes = Math.floor(Number(input) / 60);
  let seconds = Math.floor(Number(input) % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function formatSpeed(input: number) {
  if (input >= 1000000) {
    return (input / 1000000).toFixed(2) + ' MiB/s';
  }
  if (input >= 1000) {
    return (input / 1000).toFixed(0) + ' KiB/s';
  }
  return input + ' B/s';
}

export function hashString(input: string) {
  var hash = 0,
    i,
    chr;
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

let colorCache = {} as NumberDict;
export function getColor(id: string) {
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

export function getColorHex(id: string) {
  let mappings: StringDict = {
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
  return mappings[getColor(id)];
}

export const getFbPhoto = (fbId: string) =>
  `https://graph.facebook.com/${fbId}/picture?type=normal`;

export const getMediaType = (input: string) => {
  if (!input) {
    return '';
  }
  if (input.startsWith('https://www.youtube.com/')) {
    return 'youtube';
  }
  return 'video';
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

export const getMediaPathForList = (list: string) => {
  if (list.startsWith('https://gitlab.com/')) {
    const match = list.match(
      /https:\/\/gitlab.com\/api\/v4\/projects\/(.*)\/repository\/tree/
    );
    const name = match && match[1];
    const decoded = decodeURIComponent(name || '');
    return `https://glcdn.githack.com/${decoded}/-/raw/master/`;
  }
  // Nginx servers use the same mediapath as list, add trailing /
  return list + '/';
};

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
  // { urls: 'turn:13.66.162.252:3478', username: 'username', credential: 'password' },
  {
    urls: 'turn:212.47.251.184:3478',
    username: 'username',
    credential: 'password',
  },
  {
    urls: 'turn:numb.viagenie.ca',
    credential: 'watchparty',
    username: 'howardzchung@gmail.com',
  },
];

export const serverPath =
  process.env.REACT_APP_SERVER_HOST ||
  `${window.location.protocol}//${window.location.hostname}${
    process.env.NODE_ENV === 'production' ? '' : ':8080'
  }`;
