/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

window.connect = () => {
    const remoteId = document.getElementById('remote-id').value;
    if (remoteId && remoteId.length > 2) {
        // disable connect button
        document.getElementById('connect').disabled = true;
        document.getElementById('remote-id').disabled = true;

        window.electron.connect(remoteId);
    }
};

window.sendMessage = () => {
    const remoteId = document.getElementById('remote-id').value;
    if (remoteId && remoteId.length > 2) {
        let msg = document.getElementById('new-message').value;
        if (msg && msg.length > 0) {
            document.getElementById('new-message').value = '';
            document.getElementById('messages').value += 'me> ' + msg + '\n';
            window.electron.sendMessage(remoteId, msg);
        }
    }
};

window.sendRandomMessage = () => {
    let enabled = document.getElementById('sendRandom').checked;
    let interval = document.getElementById('randomInterval').value;
    window.electron.sendRandomMessage(enabled, interval);
};
