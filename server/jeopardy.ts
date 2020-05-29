import { Socket } from 'socket.io';
import Redis from 'ioredis';
import { BooleanDict, StringDict, NumberDict, User } from '.';
import { Room } from './room';
const jData = require('../jeopardy.json');

let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

// Do a game count
// let counts: NumberDict = {};
// let clueCount = 0;
// Object.values(jData).forEach((ep: any) => {
//   if (!counts[ep.info]) {
//     counts[ep.info] = 0;
//   }
//   counts[ep.info] += 1;
//   clueCount += ep.jeopardy.length + ep.double.length + ep.final.length;
// });
// console.log(counts, clueCount);

interface RawQuestion {
  val: number;
  cat: string;
  x?: number;
  y?: number;
  q?: string;
  a?: string;
  dd?: boolean;
}

interface Question {
  value: number;
  category: string;
  question?: string;
  answer?: string;
  daily_double?: boolean;
}

function constructBoard(questions: RawQuestion[]) {
  // Map of x_y coordinates to questions
  let output: { [key: string]: RawQuestion } = {};
  questions.forEach((q) => {
    output[`${q.x}_${q.y}`] = q;
  });
  return output;
}

function constructPublicBoard(questions: RawQuestion[]) {
  // Map of x_y coordinates to questions
  let output: { [key: string]: Question } = {};
  questions.forEach((q) => {
    output[`${q.x}_${q.y}`] = {
      value: q.val,
      category: q.cat,
    };
  });
  return output;
}

function syllableCount(word: string) {
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

function getPerQuestionState() {
  return {
    currentQ: '',
    currentAnswer: undefined as string | undefined,
    currentValue: 0,
    currentJudgeAnswer: undefined as string | undefined,
    currentJudgeAnswerIndex: undefined as number | undefined,
    currentDailyDouble: false,
    waitingForWager: undefined as BooleanDict | undefined,
    playClueDuration: 0,
    playClueEndTS: 0,
    questionDuration: 0,
    questionEndTS: 0,
    buzzUnlockTS: 0,
    answers: {} as StringDict,
    submitted: {} as BooleanDict,
    buzzes: {} as NumberDict,
    readings: {} as BooleanDict,
    skips: {} as BooleanDict,
    judges: {} as BooleanDict,
    wagers: {} as NumberDict,
    canBuzz: false,
    canNextQ: false,
    dailyDoublePlayer: undefined as string | undefined,
  };
}

function getGameState(
  epNum?: string,
  airDate?: string,
  info?: string,
  jeopardy?: Question[],
  double?: Question[],
  final?: Question[]
) {
  return {
    jeopardy,
    double,
    final,
    answers: {} as StringDict,
    wagers: {} as NumberDict,
    board: {} as { [key: string]: RawQuestion },
    public: {
      epNum,
      airDate,
      info,
      board: {} as { [key: string]: Question },
      scores: {} as NumberDict, // player scores
      round: '', // jeopardy or double or final
      picker: undefined as string | undefined, // If null let anyone pick, otherwise last correct answer
      ...getPerQuestionState(),
    },
  };
}

export class Jeopardy {
  public jpd: ReturnType<typeof getGameState>;
  public roomId: string;
  private io: SocketIO.Server;
  private roster: User[];
  private room: Room;
  private playClueTimeout: NodeJS.Timeout = (undefined as unknown) as NodeJS.Timeout;
  private questionAnswerTimeout: NodeJS.Timeout = (undefined as unknown) as NodeJS.Timeout;

  constructor(
    io: SocketIO.Server,
    roomId: string,
    roster: User[],
    room: Room,
    gameData?: any
  ) {
    this.io = io;
    this.roomId = roomId;
    this.roster = roster;
    this.room = room;

    if (gameData) {
      this.jpd = gameData;
      // Reconstruct the timeouts from the saved state
      if (this.jpd.public.questionEndTS) {
        const remaining = this.jpd.public.questionEndTS - Number(new Date());
        console.log('[QUESTIONENDTS]', remaining);
        this.setQuestionAnswerTimeout(remaining);
      }
      if (this.jpd.public.playClueEndTS) {
        const remaining = this.jpd.public.playClueEndTS - Number(new Date());
        console.log('[PLAYCLUEENDTS]', remaining);
        this.setPlayClueTimeout(remaining);
      }
    } else {
      this.jpd = getGameState(undefined, undefined, undefined, [], [], []);
    }

    this.io.of(this.roomId).on('connection', (socket: Socket) => {
      this.jpd.public.scores[socket.id] = 0;
      this.emitState();

      socket.on('JPD:cmdIntro', () => {
        this.io.of(this.roomId).emit('JPD:playIntro');
      });
      socket.on('JPD:init', () => {
        if (this.jpd) {
          socket.emit('JPD:state', this.jpd.public);
        }
      });
      socket.on('JPD:reconnect', (id: string) => {
        // Make sure the ID doesn't belong to a player already in the roster
        if (this.roster.some((p) => p.id === id)) {
          return;
        }
        // Transfer old state to this player
        if (this.jpd.public.scores && this.jpd.public.scores[id]) {
          this.jpd.public.scores[socket.id] = this.jpd.public.scores[id];
          delete this.jpd.public.scores[id];
        }
        if (
          this.jpd.public.waitingForWager &&
          this.jpd.public.waitingForWager[id]
        ) {
          this.jpd.public.waitingForWager[
            socket.id
          ] = this.jpd.public.waitingForWager[id];
          delete this.jpd.public.waitingForWager[id];
        }
        if (this.jpd.public.buzzes && this.jpd.public.buzzes[id]) {
          this.jpd.public.buzzes[socket.id] = this.jpd.public.buzzes[id];
          delete this.jpd.public.buzzes[id];
        }
        if (this.jpd.public.dailyDoublePlayer === id) {
          this.jpd.public.dailyDoublePlayer = socket.id;
        }
        if (this.jpd.public.picker === id) {
          this.jpd.public.picker = socket.id;
        }
        this.emitState();
      });
      socket.on('JPD:start', (episode, filter) => {
        this.loadEpisode(episode, filter);
      });
      socket.on('JPD:pickQ', (id: string) => {
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
              this.jpd.public.buzzes[p.id] = Number(new Date());
            } else {
              this.jpd.public.submitted[p.id] = true;
            }
          });
          this.io.of(this.roomId).emit('JPD:playDailyDouble');
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
        if (answer && answer.length > 1024) {
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
      socket.on('JPD:judge', async (data) => {
        const msg = {
          id: socket.id,
          cmd: 'judge',
          msg: JSON.stringify({
            id: data.id,
            answer: this.jpd.public.answers[data.id],
            correct: data.correct,
          }),
        };
        const correct = this.jpd.public.currentAnswer;
        const submitted = this.jpd.public.answers[data.id];
        const success = this.judgeAnswer(data);
        if (success) {
          this.room.addChatMessage(socket, msg);
          if (data.correct && redis) {
            // If the answer was judged correct and non-trivial (equal lowercase), log it for analysis
            if (correct?.toLowerCase() !== submitted?.toLowerCase()) {
              await redis.lpush(
                'jpd:nonTrivialJudges',
                `${correct},${submitted},${1}`
              );
              await redis.ltrim('jpd:nonTrivialJudges', 0, 100000);
            }
          }
        }
      });
      socket.on('JPD:skipQ', () => {
        this.jpd.public.skips[socket.id] = true;
        if (
          this.jpd.public.canNextQ ||
          this.roster.every((p) => p.id in this.jpd.public.skips)
        ) {
          // If everyone votes to skip move to the next question
          // Or we are in the post-judging phase and can move on
          this.nextQuestion();
        } else {
          this.emitState();
        }
      });
      socket.on('disconnect', () => {
        if (this.jpd && this.jpd.public) {
          // If player being judged leaves, rule them wrong
          if (this.jpd.public.currentJudgeAnswer === socket.id) {
            // This is done for now to run the rest of the code around judging
            // Might be better not to penalize and treat as just not having answered
            this.judgeAnswer({ id: socket.id, correct: false });
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

  loadEpisode(number: string, filter: string) {
    console.log('[LOADEPISODE]', number, filter);
    // Load question data into game
    let nums = Object.keys(jData);
    if (filter) {
      // Only load episodes with info matching the filter: kids, teen, college etc.
      nums = nums.filter(
        (num) => (jData as any)[num].info && (jData as any)[num].info === filter
      );
    }
    if (!number) {
      // Random an episode
      number = nums[Math.floor(Math.random() * nums.length)];
    }
    let loadedData = (jData as any)[number];
    if (loadedData) {
      const { epNum, airDate, info, jeopardy, double, final } = loadedData;
      this.jpd = getGameState(epNum, airDate, info, jeopardy, double, final);
      this.nextRound();
    }
  }

  emitState() {
    this.io.of(this.roomId).emit('JPD:state', this.jpd.public);
  }

  playCategories() {
    this.io.of(this.roomId).emit('JPD:playCategories');
  }

  resetAfterQuestion() {
    this.jpd.answers = {};
    this.jpd.wagers = {};
    clearTimeout(this.playClueTimeout);
    clearTimeout(this.questionAnswerTimeout);
    this.jpd.public = { ...this.jpd.public, ...getPerQuestionState() };
  }

  nextQuestion() {
    delete this.jpd.public.board[this.jpd.public.currentQ];
    this.resetAfterQuestion();
    if (Object.keys(this.jpd.public.board).length === 0) {
      this.nextRound();
    } else {
      this.emitState();
      this.io.of(this.roomId).emit('JPD:playMakeSelection');
    }
  }

  nextRound() {
    this.resetAfterQuestion();
    // advance round counter
    if (this.jpd.public.round === 'jeopardy') {
      this.jpd.public.round = 'double';
      // If double, person with lowest score is picker
      // This is nlogn rather than n, but prob ok for small numbers of players
      const playersWithScores = this.roster.map((p) => ({
        id: p.id,
        score: this.jpd.public.scores[p.id] || 0,
      }));
      playersWithScores.sort((a, b) => a.score - b.score);
      this.jpd.public.picker = playersWithScores[0]?.id;
    } else if (this.jpd.public.round === 'double') {
      this.jpd.public.round = 'final';
      const now = Number(new Date());
      this.jpd.public.waitingForWager = {};
      this.roster.forEach((p) => {
        this.jpd.public.waitingForWager![p.id] = true;
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
        this.jpd.public.buzzes[pid] = now;
      });
      // Play the category sound
      this.io.of(this.roomId).emit('JPD:playRightanswer');
    } else if (this.jpd.public.round === 'final') {
      this.jpd.public.round = 'end';
    } else {
      this.jpd.public.round = 'jeopardy';
    }
    if (
      this.jpd.public.round === 'jeopardy' ||
      this.jpd.public.round === 'double' ||
      this.jpd.public.round === 'final'
    ) {
      this.jpd.board = constructBoard((this.jpd as any)[this.jpd.public.round]);
      this.jpd.public.board = constructPublicBoard(
        (this.jpd as any)[this.jpd.public.round]
      );
    }
    this.emitState();
    if (
      this.jpd.public.round === 'jeopardy' ||
      this.jpd.public.round === 'double'
    ) {
      console.log('[PLAYCATEGORIES]', this.jpd.public.round);
      this.playCategories();
    }
  }

  unlockAnswer(duration = 15000) {
    const durationMs = Number(duration);
    this.jpd.public.questionDuration = durationMs;
    this.jpd.public.questionEndTS = Number(new Date()) + durationMs;
    this.setQuestionAnswerTimeout(duration);
  }

  setQuestionAnswerTimeout(durationMs: number) {
    this.questionAnswerTimeout = setTimeout(() => {
      if (this.jpd.public.round !== 'final') {
        this.io.of(this.roomId).emit('JPD:playTimesUp');
      }
      this.revealAnswer();
    }, durationMs);
  }

  revealAnswer() {
    console.log('[REVEALANSWER]');
    clearTimeout(this.questionAnswerTimeout);
    this.jpd.public.questionDuration = 0;
    this.jpd.public.questionEndTS = 0;

    // Add empty answers for anyone who buzzed but didn't submit anything
    Object.keys(this.jpd.public.buzzes).forEach((key) => {
      if (!this.jpd.answers[key]) {
        this.jpd.answers[key] = '';
      }
    });
    this.jpd.public.canBuzz = false;
    if (this.jpd.public.round !== 'final') {
      // In final, reveal one by one during judging
      this.jpd.public.answers = { ...this.jpd.answers };
    }
    this.jpd.public.currentAnswer = this.jpd.board[this.jpd.public.currentQ].a;
    this.advanceJudging();
    if (!this.jpd.public.currentJudgeAnswer) {
      this.jpd.public.canNextQ = true;
    }
    this.emitState();
  }

  advanceJudging() {
    console.log('[ADVANCEJUDGING]', this.jpd.public.currentJudgeAnswerIndex);
    if (this.jpd.public.currentJudgeAnswerIndex === undefined) {
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
    this.jpd.public.answers[
      this.jpd.public.currentJudgeAnswer
    ] = this.jpd.answers[this.jpd.public.currentJudgeAnswer];

    // If the current judge player isn't connected, advance again
    if (
      this.jpd.public.currentJudgeAnswer &&
      !this.roster.find((p) => p.id === this.jpd.public.currentJudgeAnswer)
    ) {
      console.log(
        '[ADVANCEJUDGING] player not found, moving on:',
        this.jpd.public.currentJudgeAnswer
      );
      this.advanceJudging();
    }
  }

  judgeAnswer({ id, correct }: { id: string; correct: boolean }) {
    if (id in this.jpd.public.judges) {
      // Already judged this player
      return false;
    }
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
    }

    this.advanceJudging();

    if (this.jpd.public.round === 'final') {
      // We can have multiple correct answers in final, so only move on if everyone is done
      if (!this.jpd.public.currentJudgeAnswer) {
        this.jpd.public.canNextQ = true;
        this.nextQuestion();
      } else {
        this.emitState();
      }
    } else {
      if (correct || !this.jpd.public.currentJudgeAnswer) {
        this.jpd.public.canNextQ = true;
        this.nextQuestion();
      } else {
        this.emitState();
      }
    }
    return true;
  }

  submitWager(id: string, wager: number) {
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
      this.jpd.public.waitingForWager = undefined;
      this.jpd.public.board[this.jpd.public.currentQ].question = this.jpd.board[
        this.jpd.public.currentQ
      ].q;
      this.triggerPlayClue();
      this.emitState();
    }
    if (this.jpd.public.round === 'final' && this.jpd.public.currentQ) {
      // store the wagers privately until everyone's made one
      this.jpd.wagers[id] = numWager;
      if (this.jpd.public.waitingForWager) {
        delete this.jpd.public.waitingForWager[id];
      }
      if (
        Object.keys(this.jpd.public.buzzes).every((id) => id in this.jpd.wagers)
      ) {
        // if final, reveal clue if all players made wager
        this.jpd.public.waitingForWager = undefined;
        this.jpd.public.board[
          this.jpd.public.currentQ
        ].question = this.jpd.board[this.jpd.public.currentQ].q;
        this.triggerPlayClue();
      }
      this.emitState();
    }
  }

  triggerPlayClue() {
    const clue = this.jpd.public.board[this.jpd.public.currentQ];
    this.io
      .of(this.roomId)
      .emit('JPD:playClue', this.jpd.public.currentQ, clue && clue.question);
    let speakingTime = 0;
    if (clue && clue.question) {
      // Allow some time for reading the text, based on content
      // Count syllables in text, assume speaking rate of 4 syll/sec
      const syllCountArr = clue.question
        .split(' ')
        .map((word: string) => syllableCount(word));
      const totalSyll = syllCountArr.reduce((a: number, b: number) => a + b, 0);
      speakingTime = (totalSyll / 4) * 1000;
      console.log('[TRIGGERPLAYCLUE]', clue.question, totalSyll, speakingTime);
      this.jpd.public.playClueDuration = speakingTime;
      this.jpd.public.playClueEndTS = Number(new Date()) + speakingTime;
    }
    this.setPlayClueTimeout(speakingTime);
  }

  setPlayClueTimeout(duration: number) {
    this.playClueTimeout = setTimeout(() => {
      this.playClueDone();
    }, duration);
  }

  playClueDone() {
    console.log('[PLAYCLUEDONE]');
    clearTimeout(this.playClueTimeout);
    this.jpd.public.playClueDuration = 0;
    this.jpd.public.playClueEndTS = 0;
    this.jpd.public.buzzUnlockTS = Number(new Date());

    if (this.jpd.public.currentDailyDouble) {
      this.unlockAnswer();
    } else if (this.jpd.public.round === 'final') {
      this.unlockAnswer(30000);
      // Play final jeopardy music
      this.io.of(this.roomId).emit('JPD:playFinalJeopardy');
    } else {
      this.jpd.public.canBuzz = true;
      this.unlockAnswer();
    }
    this.emitState();
  }

  toJSON() {
    return this.jpd;
  }
}
