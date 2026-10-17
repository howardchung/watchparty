"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uaTestCases = void 0;
exports.uaTestCases = [
    {
        desc: 'Chrome 140 (MacOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        userAgentData: {
            brands: [
                {
                    brand: 'Chromium',
                    version: '140',
                },
                {
                    brand: 'Not=A?Brand',
                    version: '24',
                },
                {
                    brand: 'Google Chrome',
                    version: '140',
                },
            ],
            mobile: false,
            platform: 'macOS',
        },
        expect: 'Chrome111',
    },
    {
        desc: 'Chrome Canary 142 (MacOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        userAgentData: {
            brands: [
                {
                    brand: 'Chromium',
                    version: '142',
                },
                {
                    brand: 'Google Chrome',
                    version: '142',
                },
                {
                    brand: 'Not_A Brand',
                    version: '99',
                },
            ],
            mobile: false,
            platform: 'macOS',
        },
        expect: 'Chrome111',
    },
    {
        desc: 'Microsoft Edge 140 (MacOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
        userAgentData: {
            brands: [
                {
                    brand: 'Chromium',
                    version: '140',
                },
                {
                    brand: 'Not=A?Brand',
                    version: '24',
                },
                {
                    brand: 'Microsoft Edge',
                    version: '140',
                },
            ],
            mobile: false,
            platform: 'macOS',
        },
        expect: 'Chrome111',
    },
    {
        desc: 'Opera 122 (MacOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0',
        userAgentData: {
            brands: [
                {
                    brand: 'Not)A;Brand',
                    version: '8',
                },
                {
                    brand: 'Chromium',
                    version: '138',
                },
                {
                    brand: 'Opera',
                    version: '122',
                },
            ],
            mobile: false,
            platform: 'macOS',
        },
        expect: 'Chrome111',
    },
    {
        desc: 'Firefox 142 (on MacOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0',
        expect: 'Firefox120',
    },
    {
        desc: 'Safari 18 (on MacOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15',
        expect: 'Safari12',
    },
    {
        desc: 'Microsoft Edge 100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1108.55 Safari/537.36 Edg/100.0.1108.55',
        expect: 'Chrome74',
    },
    {
        desc: 'Mac (Intel) Chrome 112',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        expect: 'Chrome111',
    },
    {
        desc: 'iPhone iOS 16',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
        expect: 'Safari12',
    },
    {
        desc: 'Generic Android Chrome 112',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; M2012K11AG) AppleWebKit/537.36 (KHTML, like Gecko) Soul/4.0 Chrome/112.0.5615.135 Mobile Safari/537.36',
        expect: 'Chrome111',
    },
    {
        desc: 'Motorola Edge Chrome 104',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; motorola edge) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Mobile Safari/537.36',
        expect: 'Chrome74',
    },
    {
        desc: 'In-app WebView (Android)',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; G91 Pro Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.130 Mobile Safari/537.36',
        expect: 'Chrome111',
    },
    {
        desc: 'Brave',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.4044.113 Safari/5370.36 Brave/9085',
        expect: 'Chrome111',
    },
    {
        desc: 'In-app WebView (Android) (Facebook)',
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-S908U1 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.88 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/377.0.0.22.107;]',
        expect: 'Chrome74',
    },
    {
        desc: 'Firefox (iOS)',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/142.0.1 Mobile/15E148 Safari/605.1.15',
        expect: 'Safari12',
    },
    {
        desc: 'In-app WKWebView (iOS) (TikTok)',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_21.1.0 JsSdk/2.0 NetType/4G Channel/App Store ByteLocale/ru Region/RU ByteFullLocale/ru-RU isDarkMode/1 WKWebView/1 BytedanceWebview/d8a21c6',
        expect: 'Safari12',
    },
    {
        desc: 'In-app WkWebView (iOS) (WeChat)',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.37(0x1800252f) NetType/WIFI Language/zh_CN',
        expect: 'Safari12',
    },
    {
        desc: 'Custom Webview in iPad',
        userAgent: 'Mozilla/5.0 (iPad; CPU iPadOS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1 MyApp/1.0',
        expect: 'Safari12',
    },
    {
        desc: 'Chrome Mobile (iOS)',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/114.0.5735.124 Mobile/15E148 Safari/604.1',
        expect: 'Safari12',
    },
    {
        desc: 'Fake Foo Invalid Browser - Unsupported',
        userAgent: 'Fake/5.0 (Foo; Bar Lalala OS_19.5) Foo/22.2',
        expect: undefined,
    },
    {
        // Zoom App Marketplace browser.
        desc: 'Zoom App Marketplace browser - Unsupported',
        userAgent: 'Mozilla/5.0 ZoomWebKit/537.36 (KHTML, like Gecko) ZoomApps/1.0',
        expect: undefined,
    },
    {
        desc: 'Electron in Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Electron/37.4.0 Chrome/138.0.7204.243 Safari/537.36',
        expect: 'Chrome111',
    },
    {
        desc: 'Samsung Browser (Android)',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
        expect: 'Chrome111',
    },
];
