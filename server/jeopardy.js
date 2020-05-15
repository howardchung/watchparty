const jData = require('../jeopardy.json');

function constructBoard(questions, isPublic) {
  // Map of x_y coordinates to questions
  let output = {};
  questions.forEach((q) => {
    if (!isPublic) {
      output[`${q.x}_${q.y}`] = q;
    } else {
      output[`${q.x}_${q.y}`] = {
        value: q.val,
        category: q.cat,
      };
    }
  });
  return output;
}

function syllableCount(word) {
  word = word.toLowerCase(); //word.downcase!
  if (word.length <= 3) {
    return 1;
  }
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, ''); //word.sub!(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '');
  let vowels = word.match(/[aeiouy]{1,2}/g);
  // Use 3 as the default if no letters, it's probably a year
  return vowels ? vowels.length : 3;
}

module.exports = class Jeopardy {
  constructor(io, roomId, roster) {
    this.jpd = null;
    this.roster = roster;

    this.getPerQuestionState = () => {
      return {
        currentQ: null,
        currentAnswer: null,
        currentValue: 0,
        currentJudgeAnswer: null,
        currentJudgeAnswerIndex: null,
        currentDailyDouble: false,
        waitingForWager: null,
        playClueDuration: 0,
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
      };
    };

    this.loadEpisode = (number, filter) => {
      // Load question data into game
      let nums = Object.keys(jData);
      if (filter) {
        // Only load episodes with info matching the filter: kids, teen, college etc.
        nums = nums.filter(
          (num) => jData[num].info && jData[num].info === filter
        );
      }
      if (!number) {
        // Random an episode
        number = Number(nums[Math.floor(Math.random() * nums.length)]);
      }
      let loadedData = jData[number];
      const epNum = loadedData.epNum;
      const airDate = loadedData.airDate;
      const info = loadedData.info;

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
          info,
          board: {},
          scores: {}, // player scores
          round: '', // jeopardy or double or final
          picker: null, // If null let anyone pick, otherwise last correct answer
          ...this.getPerQuestionState(),
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
      this.jpd.public = { ...this.jpd.public, ...this.getPerQuestionState() };
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
      ].a;
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
      this.jpd.public.currentJudgeAnswer = Object.keys(this.jpd.public.buzzes)[
        this.jpd.public.currentJudgeAnswerIndex
      ];
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
        ].question = this.jpd.board[this.jpd.public.currentQ].q;
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
          ].question = this.jpd.board[this.jpd.public.currentQ].q;
          this.triggerPlayClue();
        }
        this.emitState();
      }
    };

    this.triggerPlayClue = () => {
      const clue = this.jpd.public.board[this.jpd.public.currentQ];
      io.of(roomId).emit(
        'JPD:playClue',
        this.jpd.public.currentQ,
        clue && clue.question
      );
      let speakingTime = 0;
      if (clue && clue.question) {
        // Allow some time for reading the text, based on content
        // Count syllables in text, assume speaking rate of 4 syll/sec
        const syllCountArr = clue.question
          .split(' ')
          .map((word) => syllableCount(word));
        const totalSyll = syllCountArr.reduce((a, b) => a + b, 0);
        speakingTime = (totalSyll / 4) * 1000;
        console.log(
          '[TRIGGERPLAYCLUE]',
          clue.question,
          totalSyll,
          speakingTime
        );
        this.jpd.public.playClueDuration = speakingTime;
      }
      clearTimeout(this.jpd.playClueTimeout);
      this.jpd.playClueTimeout = setTimeout(() => {
        this.playClueDone();
      }, speakingTime);
    };

    this.playClueDone = () => {
      clearTimeout(this.jpd.playClueTimeout);
      this.jpd.public.playClueDuration = 0;

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

    this.loadEpisode();
    io.of(roomId).on('connection', (socket) => {
      socket.on('JPD:cmdIntro', () => {
        io.of(roomId).emit('JPD:playIntro');
      });
      socket.on('JPD:init', () => {
        if (this.jpd) {
          socket.emit('JPD:state', this.jpd.public);
        }
      });
      socket.on('JPD:start', (episode, filter) => {
        this.loadEpisode(episode, filter);
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
        if (this.jpd.board[id].dd) {
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
          ].question = this.jpd.board[this.jpd.public.currentQ].q;
          this.triggerPlayClue();
        }
        this.emitState();
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
