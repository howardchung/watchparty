type StringDict = { [key: string]: string };
type NumberDict = { [key: string]: number };
type PCDict = { [key: string]: RTCPeerConnection };

interface User {
    id: string;
    isVideoChat: boolean;
}

interface ChatMessage {
    timestamp: string;
    videoTS: number;
    id: string;
    cmd: string;
    msg: string;
}

interface SearchResult {
    name: string;
    size: string;
    seeders: string;
    magnet: string;
    url: string;
    img: string;
}

interface Settings {
    mediaServer?: string;
    searchServer?: string;
}