const uuid = require('uuid');
const axios = require('axios');
const FormData = require('form-data');

module.exports = class Room {
  constructor(io, roomId, roomData) {
    this.video = '';
    this.videoTS = 0;
    this.paused = false;
    this.roster = [];
    this.chat = [];
    this.tsMap = {};
    this.nameMap = {};
    this.pictureMap = {};
    this.vBrowser = undefined;

    this.serialize = () => {
      return JSON.stringify({
        video: this.video,
        videoTS: this.videoTS,
        paused: this.paused,
        nameMap: this.nameMap,
        pictureMap: this.pictureMap,
        chat: this.chat,
        vBrowser: this.vBrowser,
      });
    };

    this.deserialize = (roomData) => {
      this.video = roomData.video;
      this.videoTS = roomData.videoTS;
      this.paused = roomData.paused;
      if (roomData.chat) {
        this.chat = roomData.chat;
      }
      if (roomData.nameMap) {
        this.nameMap = roomData.nameMap;
      }
      if (roomData.pictureMap) {
        this.pictureMap = roomData.pictureMap;
      }
      if (roomData.vBrowser) {
        this.vBrowser = roomData.vBrowser;
      }
    };

    this.getHostState = () => {
      return {
        video: this.video,
        videoTS: this.videoTS,
        paused: this.paused,
      };
    };

    this.roomId = roomId;
    if (roomData) {
      this.deserialize(roomData);
    }

    setInterval(() => {
      // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    io.of(roomId).on('connection', (socket) => {
      // console.log(socket.id);
      const addChatMessage = (chatMsg) => {
        const chatWithTime = {
          ...chatMsg,
          timestamp: new Date().toISOString(),
          videoTS: this.tsMap[socket.id],
        };
        this.chat.push(chatWithTime);
        this.chat = this.chat.splice(-50);
        io.of(roomId).emit('REC:chat', chatWithTime);
      };

      const cmdHost = (data) => {
        console.log(socket.id, data);
        this.video = data;
        this.videoTS = 0;
        this.paused = false;
        this.tsMap = {};
        io.of(roomId).emit('REC:tsMap', this.tsMap);
        io.of(roomId).emit('REC:host', this.getHostState());
        if (data) {
          const chatMsg = { id: socket.id, cmd: 'host', msg: data };
          addChatMessage(chatMsg);
        }
      };

      this.roster.push({ id: socket.id });

      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('chatinit', this.chat);
      io.of(roomId).emit('roster', this.roster);

      socket.on('CMD:name', (data) => {
        if (!data) {
          return;
        }
        if (data && data.length > 100) {
          return;
        }
        this.nameMap[socket.id] = data;
        io.of(roomId).emit('REC:nameMap', this.nameMap);
      });
      socket.on('CMD:picture', (data) => {
        if (data && data.length > 10000) {
          return;
        }
        this.pictureMap[socket.id] = data;
        io.of(roomId).emit('REC:pictureMap', this.pictureMap);
      });
      socket.on('CMD:host', (data) => {
        if (data && data.length > 20000) {
          return;
        }
        const sharer = this.roster.find((user) => user.isScreenShare);
        if (sharer) {
          // Can't update the video while someone is screensharing
          return;
        }
        cmdHost(data);
      });
      socket.on('CMD:play', () => {
        socket.broadcast.emit('REC:play', this.video);
        const chatMsg = {
          id: socket.id,
          cmd: 'play',
          msg: this.tsMap[socket.id],
        };
        this.paused = false;
        addChatMessage(chatMsg);
      });
      socket.on('CMD:pause', () => {
        socket.broadcast.emit('REC:pause');
        const chatMsg = {
          id: socket.id,
          cmd: 'pause',
          msg: this.tsMap[socket.id],
        };
        this.paused = true;
        addChatMessage(chatMsg);
      });
      socket.on('CMD:seek', (data) => {
        this.videoTS = data;
        socket.broadcast.emit('REC:seek', data);
        const chatMsg = { id: socket.id, cmd: 'seek', msg: data };
        addChatMessage(chatMsg);
      });
      socket.on('CMD:ts', (data) => {
        if (data > this.videoTS) {
          this.videoTS = data;
        }
        this.tsMap[socket.id] = data;
      });
      socket.on('CMD:chat', (data) => {
        if (data && data.length > 65536) {
          // TODO add some validation on client side too so we don't just drop long messages
          return;
        }
        const chatMsg = { id: socket.id, msg: data };
        addChatMessage(chatMsg);
      });
      socket.on('CMD:joinVideo', (data) => {
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isVideoChat = true;
        }
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:leaveVideo', (data) => {
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isVideoChat = false;
        }
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:joinScreenShare', (data) => {
        const sharer = this.roster.find((user) => user.isScreenShare);
        if (sharer) {
          return;
        }
        if (data && data.file) {
          cmdHost('fileshare://' + socket.id);
        } else {
          cmdHost('screenshare://' + socket.id);
        }
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isScreenShare = true;
        }
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:leaveScreenShare', (data) => {
        // console.log('CMD:leaveScreenShare');
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isScreenShare = false;
        }
        cmdHost('');
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:startVBrowser', async () => {
        if (this.vBrowser) {
          // Maybe terminate the existing instance and spawn a new one
          return;
        }
        const { pass, host, id } = await launchVM();
        if (!pass || !host || !id) {
          return;
        }
        // TODO automatically shut this down after some timeout, or nobody in the room
        this.vBrowser = {};
        this.vBrowser.bootTime = Number(new Date());
        this.vBrowser.pass = pass;
        this.vBrowser.host = host;
        this.vBrowser.id = id;
        this.roster.forEach((user, i) => {
          if (user.id === socket.id) {
            this.roster[i].isController = true;
          } else {
            this.roster[i].isController = false;
          }
        });
        cmdHost('vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host);
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:stopVBrowser', async () => {
        // shut down the VM
        if (this.vBrowser) {
          await terminateVM(this.vBrowser.id);
          this.vBrowser = undefined;
          this.roster.forEach((user, i) => {
            this.roster[i].isController = false;
          });
          cmdHost('');
        }
      });
      socket.on('CMD:changeController', (data) => {
        this.roster.forEach((user, i) => {
          if (user.id === data) {
            this.roster[i].isController = true;
          } else {
            this.roster[i].isController = false;
          }
        });
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:askHost', () => {
        socket.emit('REC:host', this.getHostState());
      });
      socket.on('signal', (data) => {
        io.of(roomId)
          .to(data.to)
          .emit('signal', { from: socket.id, msg: data.msg });
      });
      socket.on('signalSS', (data) => {
        io.of(roomId).to(data.to).emit('signalSS', {
          from: socket.id,
          sharer: data.sharer,
          msg: data.msg,
        });
      });

      socket.on('disconnect', () => {
        let index = this.roster.findIndex((user) => user.id === socket.id);
        const removed = this.roster.splice(index, 1)[0];
        io.of(roomId).emit('roster', this.roster);
        if (removed.isScreenShare) {
          // Reset the room state since we lost the screen sharer
          cmdHost('');
        }
        // delete nameMap[socket.id];
        // delete tsMap[socket.id];
      });
    });
  }
};

async function launchVM(password) {
  // generate credentials and boot a VM
  try {
    const password = uuid.v4();
    const response = await axios({
      method: 'POST',
      url: 'https://api.scaleway.com/instance/v1/zones/fr-par-1/servers',
      headers: {
        'X-Auth-Token': process.env.SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        name: password,
        dynamic_ip_required: true,
        commercial_type: 'DEV1-S',
        // image: 'ce6c9d21-0ff3-4355-b385-c930c9f22d9d', // ubuntu focal
        image: '8b7f4e65-8f3d-467e-8c63-ba6517bce5ca',
        // image: 'a178943a-d2ae-449f-b8c0-80ca5447831f', // new customized ubuntu bionic
        volumes: {},
        organization: process.env.SCW_ORGANIZATION_ID,
        tags: ['vbrowser'],
      },
    });
    console.log(response.data);
    const id = response.data.server.id;
    const host = `${id}.pub.cloud.scaleway.com`;
    // set userdata for boot action
    const cloudInit = `#!/bin/bash
until nslookup ${host}
do
sleep 5
echo "Trying DNS lookup again..."
done
    
# Generate cert with letsencrypt
certbot certonly --standalone -n --agree-tos --email howardzchung@gmail.com --domains ${host}

# start browser
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 5000
docker run -d --rm --name=vbrowser -v /etc/letsencrypt/archive/${host}:/cert -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=${password} -e NEKO_PASSWORD_ADMIN=${password} -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_KEY="/cert/privkey1.pem" -e NEKO_CERT="/cert/fullchain1.pem" nurdism/neko:chromium
`;
    const cloudInitNoSsl = `#!/bin/bash
# start browser
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
docker run -d --rm --name=vbrowser -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=${password} -e NEKO_PASSWORD_ADMIN=${password} -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" nurdism/neko:chromium
`;
    const response2 = await axios({
      method: 'PATCH',
      url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/user_data/cloud-init`,
      headers: {
        'X-Auth-Token': process.env.SCW_SECRET_KEY,
        'Content-Type': 'text/plain',
      },
      data: cloudInit,
    });
    console.log(response2.data);
    // boot the instance
    const response3 = await axios({
      method: 'POST',
      url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
      headers: {
        'X-Auth-Token': process.env.SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'poweron',
      },
    });
    console.log(response3.data);
    let state = '';
    let retryCount = 0;
    while (!state) {
      // poll for status
      try {
        const response4 = await axios({
          method: 'GET',
          url: 'https://' + host,
        });
        state = response4.data.slice(100);
      } catch (e) {
        // console.log(e);
      }
      console.log(retryCount, state);
      retryCount += 1;
      if (retryCount >= 200) {
        throw new Error('timed out waiting for instance');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    return { pass: password, host: host, id };
  } catch (e) {
    console.error(e);
    // console.error(e.response.status, e.response.data);
    return {};
  }
}

async function terminateVM(id) {
  const response = await axios({
    method: 'POST',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
    headers: {
      'X-Auth-Token': process.env.SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      action: 'terminate',
    },
  });
}

// TODO listvms
// TODO process to check current pool and spawn new instances if needed
// TODO process to terminate any VMs that are too old and no one's using
// TODO terminate VMs when they're released
