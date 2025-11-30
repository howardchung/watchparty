/* eslint-disable @typescript-eslint/no-var-requires */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    connect: (remoteId) => ipcRenderer.send('connect', remoteId),
    sendMessage: (remoteId, msg) => ipcRenderer.send('send-message', remoteId, msg),
    sendRandomMessage: (enabled, interval) => ipcRenderer.send('send-random-message', enabled, interval),
});

ipcRenderer.on('my-id', (e, myId) => {
    document.getElementById('my-id').innerHTML = myId;
});

ipcRenderer.on('message', (e, remoteId, msg) => {
    document.getElementById('messages').value += remoteId + '> ' + msg + '\n';
});

ipcRenderer.on('connect', (e, remoteId) => {
    document.getElementById('connect').disabled = true;
    document.getElementById('remote-id').disabled = true;
    document.getElementById('remote-id').value = remoteId;
});

ipcRenderer.on('state-update', (e, state) => {
    document.getElementById('state').innerHTML = state;
});
