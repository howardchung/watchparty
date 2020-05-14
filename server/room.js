const { assignVM, resetVM } = require('./vm');
const jData = require('../jeopardy.json');

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

      function constructBoard(questions, isPublic) {
        // Map of x_y coordinates to questions
        let output = {};
        questions.forEach((q) => {
          if (!isPublic) {
            output[`${q.xcoord}_${q.ycoord}`] = q;
          } else {
            output[`${q.xcoord}_${q.ycoord}`] = {
              value: q.value,
              category: q.category,
            };
          }
        });
        return output;
      }

      this.loadEpisode = (number) => {
        // Load question data into game
        if (!number) {
          // Random
          const nums = Object.keys(jData);
          number = Number(nums[Math.floor(Math.random() * nums.length)]);
        }
        let loadedData = jData[number];
        const epNum = loadedData.epNum;
        const airDate = loadedData.airDate;

        this.jpd = {
          loadedData,
          answers: {},
          wagers: {},
          board: {},
          playClueTimeout: null,
          questionAnswerTimeout: null,
          public: {
            epNum,
            airDate,
            board: {},
            scores: {}, // player scores
            round: '', // jeopardy or double or final
            picker: null, // If null let anyone pick, otherwise last correct answer
            currentQ: null,
            currentAnswer: null,
            currentValue: 0,
            currentJudgeAnswer: null,
            currentJudgeAnswerIndex: null,
            currentDailyDouble: false,
            waitingForWager: null,
            questionDuration: 0,
            answers: {},
            submitted: {},
            buzzes: {},
            readings: {},
            skips: {},
            judges: {},
            wagers: {},
            canBuzz: false,
            canNextQ: false,
            dailyDoublePlayer: null,
          },
        };
        this.nextRound();
      };

      this.emitState = () => {
        io.of(roomId).emit('JPD:state', this.jpd.public);
      };

      this.playCategories = () => {
        io.of(roomId).emit('JPD:playCategories');
      };

      this.resetAfterQuestion = () => {
        this.jpd.answers = {};
        this.jpd.wagers = {};
        clearTimeout(this.jpd.playClueTimeout);
        clearTimeout(this.jpd.questionAnswerTimeout);
        this.jpd.public.currentQ = null;
        this.jpd.public.currentAnswer = null;
        this.jpd.public.currentValue = 0;
        this.jpd.public.currentJudgeAnswer = null;
        this.jpd.public.currentJudgeAnswerIndex = null;
        this.jpd.public.currentDailyDouble = false;
        this.jpd.public.waitingForWager = null;
        this.jpd.public.questionDuration = 0;
        this.jpd.public.answers = {};
        this.jpd.public.submitted = {};
        this.jpd.public.buzzes = {};
        this.jpd.public.readings = {};
        this.jpd.public.skips = {};
        this.jpd.public.judges = {};
        this.jpd.public.wagers = {};
        this.jpd.public.canBuzz = false;
        this.jpd.public.canNextQ = false;
        this.jpd.public.dailyDoublePlayer = null;
      };

      this.nextQuestion = () => {
        delete this.jpd.public.board[this.jpd.public.currentQ];
        this.resetAfterQuestion();
        if (Object.keys(this.jpd.public.board).length === 0) {
          this.nextRound();
        }
      };

      this.nextRound = () => {
        this.resetAfterQuestion();
        // advance round counter
        if (this.jpd.public.round === 'jeopardy') {
          this.jpd.public.round = 'double';
          // If double, person with lowest score is picker
          let min = Infinity;
          Object.keys(this.jpd.public.scores).forEach((key) => {
            const score = this.jpd.public.scores[key] || 0;
            if (score < min) {
              min = score;
              this.jpd.public.picker = key;
            }
          });
        } else if (this.jpd.public.round === 'double') {
          this.jpd.public.round = 'final';
          this.jpd.public.waitingForWager = {};
          this.roster.forEach((p) => {
            this.jpd.public.waitingForWager[p.id] = true;
          });
          // autopick the question
          this.jpd.public.currentQ = '1_1';
          // autobuzz the players in ascending score order
          let playerIds = this.roster.map((p) => p.id);
          playerIds.sort(
            (a, b) =>
              Number(this.jpd.public.scores[a] || 0) -
              Number(this.jpd.public.scores[b] || 0)
          );
          playerIds.forEach((pid) => {
            this.jpd.public.buzzes[pid] = true;
          });
          // Play the category sound
          io.of(roomId).emit('JPD:playRightanswer');
        } else if (this.jpd.public.round === 'final') {
          this.jpd.public.round = 'end';
        } else {
          this.jpd.public.round = 'jeopardy';
        }
        if (this.jpd.public.round !== 'end') {
          this.jpd.board = constructBoard(
            this.jpd.loadedData[this.jpd.public.round]
          );
          this.jpd.public.board = constructBoard(
            this.jpd.loadedData[this.jpd.public.round],
            true
          );
        }
        this.emitState();
        if (
          this.jpd.public.round === 'jeopardy' ||
          this.jpd.public.round === 'double'
        ) {
          this.playCategories();
        }
      };

      this.unlockAnswer = (duration) => {
        const durationMs = Number(duration || 15000);
        this.jpd.public.questionDuration = durationMs;
        clearTimeout(this.jpd.questionAnswerTimeout);
        this.jpd.questionAnswerTimeout = setTimeout(() => {
          if (this.jpd.public.round !== 'final') {
            io.of(roomId).emit('JPD:playTimesUp');
          }
          console.log('questionAnswerTimeout', this.jpd.questionAnswerTimeout);
          this.revealAnswer();
        }, durationMs);
      };

      this.revealAnswer = () => {
        clearTimeout(this.jpd.questionAnswerTimeout);
        this.jpd.public.questionDuration = 0;

        // Add empty answers for anyone who buzzed but didn't submit anything
        Object.keys(this.jpd.public.buzzes).forEach((key) => {
          if (!this.jpd.answers[key]) {
            this.jpd.answers[key] = '';
          }
        });
        this.jpd.public.canBuzz = false;
        this.jpd.public.answers = this.jpd.answers;
        this.jpd.public.currentAnswer = this.jpd.board[
          this.jpd.public.currentQ
        ].answer;
        this.advanceJudging();
        if (!this.jpd.public.currentJudgeAnswer) {
          this.jpd.public.canNextQ = true;
        }
        this.emitState();
      };

      this.advanceJudging = () => {
        if (this.jpd.public.currentJudgeAnswerIndex === null) {
          this.jpd.public.currentJudgeAnswerIndex = 0;
        } else {
          this.jpd.public.currentJudgeAnswerIndex += 1;
        }
        this.jpd.public.currentJudgeAnswer = Object.keys(
          this.jpd.public.buzzes
        )[this.jpd.public.currentJudgeAnswerIndex];
        this.jpd.public.wagers[
          this.jpd.public.currentJudgeAnswer
        ] = this.jpd.wagers[this.jpd.public.currentJudgeAnswer];
      };

      this.judgeAnswer = ({ id, correct }) => {
        console.log('[JUDGE]', id, correct);
        // Currently anyone can pick the correct answer
        // Can turn this into a vote or make a non-player the host
        // MAYBE attempt auto-judging using fuzzy string match
        if (!this.jpd.public.scores[id]) {
          this.jpd.public.scores[id] = 0;
        }
        this.jpd.public.judges[id] = correct;
        if (correct) {
          this.jpd.public.scores[id] +=
            this.jpd.public.wagers[id] || this.jpd.public.currentValue;

          // Correct answer is next picker
          this.jpd.public.picker = id;
        } else {
          this.jpd.public.scores[id] -=
            this.jpd.public.wagers[id] || this.jpd.public.currentValue;

          while (
            this.jpd.public.currentJudgeAnswer &&
            this.jpd.public.currentJudgeAnswer in this.jpd.public.judges
          ) {
            this.advanceJudging();
          }
        }
        if (this.jpd.public.round === 'final') {
          // We can have multiple correct answers in final, so only move on if everyone is done
          if (this.roster.every((p) => p.id in this.jpd.public.judges)) {
            this.jpd.public.canNextQ = true;
            this.nextQuestion();
          }
        } else if (correct || !this.jpd.public.currentJudgeAnswer) {
          this.jpd.public.canNextQ = true;
          this.nextQuestion();
        }
        this.emitState();
      };

      this.submitWager = (id, wager) => {
        if (id in this.jpd.wagers) {
          return;
        }
        // User setting a wager for DD or final
        // Can bet up to current score, minimum of 1000 in single or 2000 in double, 0 in final
        let maxWager = 0;
        let minWager = 5;
        if (this.jpd.public.round === 'jeopardy') {
          maxWager = Math.max(this.jpd.public.scores[id] || 0, 1000);
        } else if (this.jpd.public.round === 'double') {
          maxWager = Math.max(this.jpd.public.scores[id] || 0, 2000);
        } else if (this.jpd.public.round === 'final') {
          minWager = 0;
          maxWager = Math.max(this.jpd.public.scores[id] || 0, 0);
        }
        let numWager = Number(wager);
        if (Number.isNaN(Number(wager))) {
          numWager = minWager;
        } else {
          numWager = Math.min(Math.max(numWager, minWager), maxWager);
        }
        console.log('[WAGER]', id, wager, numWager);
        if (id === this.jpd.public.dailyDoublePlayer) {
          this.jpd.wagers[id] = numWager;
          this.jpd.public.wagers[id] = numWager;
          this.jpd.public.waitingForWager = null;
          this.jpd.public.board[
            this.jpd.public.currentQ
          ].question = this.jpd.board[this.jpd.public.currentQ].question;
          this.triggerPlayClue();
          this.emitState();
        }
        if (this.jpd.public.round === 'final' && this.jpd.public.currentQ) {
          // store the wagers privately until everyone's made one
          this.jpd.wagers[id] = numWager;
          delete this.jpd.public.waitingForWager[id];
          if (this.roster.every((p) => p.id in this.jpd.wagers)) {
            // if final, reveal clue if all players made wager
            this.jpd.public.waitingForWager = null;
            this.jpd.public.board[
              this.jpd.public.currentQ
            ].question = this.jpd.board[this.jpd.public.currentQ].question;
            this.triggerPlayClue();
          }
          this.emitState();
        }
      };

      this.triggerPlayClue = () => {
        // trigger reads on players, keep track of current roster
        // When all of those players report read done, unlock buzz/start DD/final timer
        // We do the snapshot to avoid issues if people join during the reading
        this.jpd.snapshotRoster = [...this.roster];
        const clue = this.jpd.public.board[this.jpd.public.currentQ];
        io.of(roomId).emit(
          'JPD:playClue',
          this.jpd.public.currentQ,
          clue && clue.question
        );
        // Set a max time limit for waiting for playClueDones
        clearTimeout(this.jpd.playClueTimeout);
        this.jpd.playClueTimeout = setTimeout(() => {
          console.log('playClueTimeout', this.jpd.playClueTimeout);
          this.playClueDone();
        }, 30000);
      };

      this.playClueDone = () => {
        clearTimeout(this.jpd.playClueTimeout);
        if (this.jpd.public.currentDailyDouble) {
          this.unlockAnswer();
        } else if (this.jpd.public.round === 'final') {
          this.unlockAnswer(30000);
          // Play final jeopardy music
          io.of(roomId).emit('JPD:playFinalJeopardy');
        } else {
          this.jpd.public.canBuzz = true;
          this.unlockAnswer();
        }
        this.emitState();
      };

      socket.on('JPD:cmdIntro', () => {
        io.of(roomId).emit('JPD:playIntro');
      });
      socket.on('JPD:init', () => {
        if (this.jpd) {
          socket.emit('JPD:state', this.jpd.public);
        }
      });
      socket.on('JPD:start', (episode) => {
        this.loadEpisode(episode);
      });
      socket.on('JPD:pickQ', (id) => {
        if (
          this.jpd.public.picker &&
          this.roster.find((p) => p.id === this.jpd.public.picker) &&
          this.jpd.public.picker !== socket.id
        ) {
          return;
        }
        if (this.jpd.public.currentQ) {
          return;
        }
        if (!this.jpd.public.board[id]) {
          return;
        }
        this.jpd.public.currentQ = id;
        this.jpd.public.currentValue = this.jpd.public.board[id].value;
        // check if it's a daily double
        if (this.jpd.board[id].daily_double) {
          // if it is, don't show it yet, we need to collect wager info based only on category
          this.jpd.public.currentDailyDouble = true;
          this.jpd.public.dailyDoublePlayer = socket.id;
          this.jpd.public.waitingForWager = { [socket.id]: true };
          // Autobuzz the player, all others pass
          this.roster.forEach((p) => {
            if (p.id === socket.id) {
              this.jpd.public.buzzes[p.id] = true;
            } else {
              this.jpd.public.submitted[p.id] = true;
            }
          });
          io.of(roomId).emit('JPD:playDailyDouble');
        } else {
          // Put Q in public state
          this.jpd.public.board[
            this.jpd.public.currentQ
          ].question = this.jpd.board[this.jpd.public.currentQ].question;
          this.triggerPlayClue();
        }
        this.emitState();
      });
      socket.on('JPD:playClueDone', (question) => {
        // Make sure it matches the current question, or reject it
        // console.log('[PLAYCLUEDONE]', socket.id, question, this.jpd.public.currentQ);
        if (question !== this.jpd.public.currentQ) {
          return;
        }
        // When all players done, trigger playClueDone
        this.jpd.public.readings[socket.id] = true;
        if (
          this.jpd.snapshotRoster.every((p) => p.id in this.jpd.public.readings)
        ) {
          this.playClueDone();
        } else {
          this.emitState();
        }
      });
      socket.on('JPD:buzz', () => {
        if (!this.jpd.public.canBuzz) {
          return;
        }
        if (this.jpd.public.buzzes[socket.id]) {
          return;
        }
        this.jpd.public.buzzes[socket.id] = Number(new Date());
        this.emitState();
      });
      socket.on('JPD:answer', (question, answer) => {
        if (question !== this.jpd.public.currentQ) {
          return;
        }
        if (!this.jpd.public.questionDuration) {
          return;
        }
        console.log('[ANSWER]', socket.id, question, answer);
        if (answer) {
          this.jpd.answers[socket.id] = answer;
        }
        this.jpd.public.submitted[socket.id] = true;
        this.emitState();
        if (
          this.jpd.public.round !== 'final' &&
          this.roster.every((p) => p.id in this.jpd.public.submitted)
        ) {
          this.revealAnswer();
        }
      });

      socket.on('JPD:wager', (wager) => this.submitWager(socket.id, wager));
      socket.on('JPD:judge', this.judgeAnswer);
      socket.on('JPD:skipQ', () => {
        this.jpd.public.skips[socket.id] = true;
        if (
          this.jpd.public.canNextQ ||
          this.roster.every((p) => p.id in this.jpd.public.skips)
        ) {
          // If everyone votes to skip move to the next question
          // Or we are in the post-judging phase and can move on
          this.nextQuestion();
        }
        this.emitState();
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
        if (this.jpd && this.jpd.public) {
          // If player being judged leaves, set them to false
          if (this.jpd.public.currentJudgeAnswer === socket.id) {
            this.judgeAnswer({ id: socket.id, correct: false });
          } else {
            this.jpd.public.judges[socket.id] = false;
          }
          // If player who needs to submit wager leaves, submit 0
          if (
            this.jpd.public.waitingForWager &&
            this.jpd.public.waitingForWager[socket.id]
          ) {
            this.submitWager(socket.id, 0);
          }
        }
      });
    });
  }
};
