const { assignVM, resetVM } = require('./vm');

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
    this.jpd = undefined;
    this.roomId = roomId;

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

    this.resetRoomVM = async () => {
      const id = this.vBrowser && this.vBrowser.id;
      this.vBrowser = undefined;
      this.roster.forEach((user, i) => {
        this.roster[i].isController = false;
      });
      this.cmdHost(null, '');
      if (id) {
        try {
          await resetVM(id);
        } catch (e) {
          console.error(e);
        }
      }
    };

    this.cmdHost = (socket, data) => {
      this.video = data;
      this.videoTS = 0;
      this.paused = false;
      this.tsMap = {};
      io.of(roomId).emit('REC:tsMap', this.tsMap);
      io.of(roomId).emit('REC:host', this.getHostState());
      if (socket && data) {
        const chatMsg = { id: socket.id, cmd: 'host', msg: data };
        this.addChatMessage(socket, chatMsg);
      }
    };

    this.addChatMessage = (socket, chatMsg) => {
      const chatWithTime = {
        ...chatMsg,
        timestamp: new Date().toISOString(),
        videoTS: this.tsMap[socket.id],
      };
      this.chat.push(chatWithTime);
      this.chat = this.chat.splice(-100);
      io.of(roomId).emit('REC:chat', chatWithTime);
    };

    if (roomData) {
      this.deserialize(roomData);
    }

    setInterval(() => {
      // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    io.of(roomId).on('connection', (socket) => {
      // console.log(socket.id);
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
        this.cmdHost(socket, data);
      });
      socket.on('CMD:play', () => {
        socket.broadcast.emit('REC:play', this.video);
        const chatMsg = {
          id: socket.id,
          cmd: 'play',
          msg: this.tsMap[socket.id],
        };
        this.paused = false;
        this.addChatMessage(socket, chatMsg);
      });
      socket.on('CMD:pause', () => {
        socket.broadcast.emit('REC:pause');
        const chatMsg = {
          id: socket.id,
          cmd: 'pause',
          msg: this.tsMap[socket.id],
        };
        this.paused = true;
        this.addChatMessage(socket, chatMsg);
      });
      socket.on('CMD:seek', (data) => {
        this.videoTS = data;
        socket.broadcast.emit('REC:seek', data);
        const chatMsg = { id: socket.id, cmd: 'seek', msg: data };
        this.addChatMessage(socket, chatMsg);
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
        this.addChatMessage(socket, chatMsg);
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
          this.cmdHost(socket, 'fileshare://' + socket.id);
        } else {
          this.cmdHost(socket, 'screenshare://' + socket.id);
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
        this.cmdHost(socket, '');
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:startVBrowser', async () => {
        if (this.vBrowser) {
          // Maybe terminate the existing instance and spawn a new one
          return;
        }
        this.cmdHost(socket, 'vbrowser://');
        this.vBrowser = {};
        const assignment = await assignVM();
        if (!assignment) {
          this.cmdHost(socket, '');
          this.vBrowser = undefined;
          return;
        }
        const { pass, host, id } = assignment;
        this.vBrowser.assignTime = Number(new Date());
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
        this.cmdHost(
          null,
          'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host
        );
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:stopVBrowser', () => this.resetRoomVM());
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
      socket.on('JPD:start', (episode) => {
        // TODO manually skip clues

        this.jpd = {
          questions: [],
          answers: {},
          readingState: {},
          currentAnswer: null,
          public: {
            board: [], // categories and dollar amounts
            scores: {}, // player scores
            episodeNumber: 0,
            airDate: null,
            currentQ: null,
            currentAnswer: null,
            answers: {},
            canBuzz: false,
            buzzes: {},
            round: 'single', // single or double or final
            isDailyDouble: false,
            dailyDoublePlayer: undefined,
            picker: null, // If null let anyone pick, otherwise last correct answer
          }
        };
        // const episodes = fs.readdirSync();
        // const episode = fs.readFileSync();
        // TODO search for the the number
        // TODO or get the number range and random
        loadEpisode();
        emitState();

        function loadEpisode(number) {
          // Load question data into game
        }

        function emitState() {
          io.of(roomId).emit('JPD:state', this.jpd.public);
        }

        function resetAfterQuestion() {
          this.jpd.public.canBuzz = false;
          this.jpd.public.buzzes = {};
          this.jpd.currentAnswer = null;
          this.jpd.public.currentAnswer = null;
        }

        function nextRound() {
          resetAfterQuestion();
          // advance round counter
          // TODO If double, person with lowest score is picker
          if (this.jpd.public.round === 'single') {
            this.jpd.public.round === 'double';
          } else if (this.jpd.public.round === 'double') {
            this.jpd.public.round === 'final';
          }
          emitState();
        }

        function revealAnswer() {
          this.jpd.public.canBuzz = false;
          this.jpd.buzzes = {};
          this.jpd.public.answers = this.jpd.answers;
          this.jpd.public.currentAnswer = this.jpd.currentAnswer;
          emitState();
        }
      });
      socket.on('JPD:wager', (wager) => {
        // User setting a wager for DD or final
        // TODO validate wager based on player's current score
        // Can bet up to current score, minimum of 1000 in single or 2000 in double, 0 in final
        if (socket.id === this.public.dailyDoublePlayer) {
          this.public.currentQ.value = Number(wager) || 0;
          emitState();
        }
      });
      socket.on('JPD:pickQ', () => {
        // TODO depends on question format, input coordinates or question id?
        // Put Q in public state
        // Put A in private state
        // Remove from board
        emitState();
      });
      socket.on('JPD:readingDone', () => {
        // When all players done, can buzz
        // TODO add a max timeout of 10 seconds
        this.jpd.readingState[socket.id] = true;
        if (Object.keys(this.jpd.readingState).length >= this.roster.length) {
          this.jpd.public.canBuzz = true;
          emitState();
        }
      });
      socket.on('JPD:buzz', () => {
        // User wants to answer
        if (!this.jpd.public.canBuzz) {
          return;
        }
        if (this.jpd.public.buzzes[socket.id]) {
          return;
        }
        this.jpd.public.buzzes[socket.id] = Number(new Date());
        emitState();
      });
      socket.on('JPD:answer', (answer) => {
        // Get a player's answer
        this.jpd.answers[socket.id] = answer;
        // TODO if all players have answered or timeout exceeded
        if (Object.keys(this.jpd.answers).length >= this.roster.length) {
          revealAnswer();
        }
      });
      socket.on('JPD:pickCorrect', (id) => {
        // Currently anyone can pick the correct answer
        // Can turn this into a vote or make a non-player the host
        // Go through answers, if incorrect and before the correct, subtract
        // If correct, add
        // If incorrect and after the correct, do nothing
        let foundCorrect = false;
        Object.keys(this.jpd.answers).forEach(key => {
          const answer = this.jpd.answers[key];
          const isCorrect = key === id;
          if (isCorrect) {
            foundCorrect = true;
          }
          this.jpd.public.scores[key] = this.jpd.public.scores[key] || 0;
          if (!foundCorrect && !isCorrect) {
            this.jpd.public.scores[key] -= this.jpd.currentQ.value;
          }
          if (isCorrect) {
            this.jpd.public.scores[key] += this.jpd.currentQ.value;
          }
        });
        // Correct person is next picker
        if (id) {
          this.jpd.public.picker = id;
        }
        resetAfterQuestion();
        emitState();
        // TODO If no questions left, go next round
      });

      function emitState() {
        io.of(roomId).emit('JPD:state', this.jpd.public);
      }

      function resetAfterQuestion() {
        this.jpd.public.canBuzz = false;
        this.jpd.public.buzzes = {};
        this.jpd.currentAnswer = null;
        this.jpd.public.currentAnswer = null;
      }

      function nextRound() {
        resetAfterQuestion();
        // advance round counter
        // TODO If double, person with lowest score is picker
        if (this.jpd.public.round === 'single') {
          this.jpd.public.round === 'double';
        } else if (this.jpd.public.round === 'double') {
          this.jpd.public.round === 'final';
        }
        emitState();
      }

      function revealAnswer() {
        this.jpd.public.canBuzz = false;
        this.jpd.buzzes = {};
        this.jpd.public.answers = this.jpd.answers;
        this.jpd.public.currentAnswer = this.jpd.currentAnswer;
        emitState();
      }
      socket.on('JPD:start', (episode) => {
        // TODO manually skip clues
        this.jpd = {
          questions: [],
          answers: {},
          readingState: {},
          currentAnswer: null,
          public: {
            board: [], // categories and dollar amounts
            scores: {}, // player scores
            episodeNumber: 0,
            airDate: null,
            currentQ: null,
            currentAnswer: null,
            answers: {},
            canBuzz: false,
            buzzes: {},
            round: 'single', // single or double or final
            isDailyDouble: false,
            dailyDoublePlayer: undefined,
            picker: null, // If null let anyone pick, otherwise last correct answer
          }
        };
        // const episodes = fs.readdirSync();
        // const episode = fs.readFileSync();
        // TODO search for the the number
        // TODO or get the number range and random
        loadEpisode();
        emitState();

        function loadEpisode(number) {
          // Load question data into game
        }
      });
      socket.on('JPD:wager', (wager) => {
        // User setting a wager for DD or final
        // TODO validate wager based on player's current score
        // Can bet up to current score, minimum of 1000 in single or 2000 in double, 0 in final
        if (socket.id === this.public.dailyDoublePlayer) {
          this.public.currentQ.value = Number(wager) || 0;
          emitState();
        }
      });
      socket.on('JPD:pickQ', () => {
        // TODO depends on question format, input coordinates or question id?
        // Put Q in public state
        // Put A in private state
        // Remove from board
        emitState();
      });
      socket.on('JPD:readingDone', () => {
        // When all players done, can buzz
        // TODO add a max timeout of 10 seconds
        this.jpd.readingState[socket.id] = true;
        if (Object.keys(this.jpd.readingState).length >= this.roster.length) {
          this.jpd.public.canBuzz = true;
          emitState();
        }
      });
      socket.on('JPD:buzz', () => {
        // User wants to answer
        if (!this.jpd.public.canBuzz) {
          return;
        }
        if (this.jpd.public.buzzes[socket.id]) {
          return;
        }
        this.jpd.public.buzzes[socket.id] = Number(new Date());
        emitState();
      });
      socket.on('JPD:answer', (answer) => {
        // Get a player's answer
        this.jpd.answers[socket.id] = answer;
        // TODO if all players have answered or timeout exceeded
        if (Object.keys(this.jpd.answers).length >= this.roster.length) {
          revealAnswer();
        }
      });
      socket.on('JPD:pickCorrect', (id) => {
        // Currently anyone can pick the correct answer
        // Can turn this into a vote or make a non-player the host
        // Go through answers, if incorrect and before the correct, subtract
        // If correct, add
        // If incorrect and after the correct, do nothing
        let foundCorrect = false;
        Object.keys(this.jpd.answers).forEach(key => {
          const answer = this.jpd.answers[key];
          const isCorrect = key === id;
          if (isCorrect) {
            foundCorrect = true;
          }
          this.jpd.public.scores[key] = this.jpd.public.scores[key] || 0;
          if (!foundCorrect && !isCorrect) {
            this.jpd.public.scores[key] -= this.jpd.currentQ.value;
          }
          if (isCorrect) {
            this.jpd.public.scores[key] += this.jpd.currentQ.value;
          }
        });
        // Correct person is next picker
        if (id) {
          this.jpd.public.picker = id;
        }
        resetAfterQuestion();
        emitState();
        // TODO If no questions left, go next round
      });

      socket.on('disconnect', () => {
        let index = this.roster.findIndex((user) => user.id === socket.id);
        const removed = this.roster.splice(index, 1)[0];
        io.of(roomId).emit('roster', this.roster);
        if (removed.isScreenShare) {
          // Reset the room state since we lost the screen sharer
          this.cmdHost(socket, '');
        }
        delete this.tsMap[socket.id];
        // delete nameMap[socket.id];
      });
    });
  }
};
