import React from 'react';
import {
  Button,
  Label,
  Input,
  Icon,
  Checkbox,
  Dropdown,
} from 'semantic-ui-react';
import './Jeopardy.css';
import { getDefaultPicture, getColorHex, shuffle } from './utils';
import { Socket } from 'socket.io';

export class Jeopardy extends React.Component<{
  socket: Socket;
  participants: User[];
  nameMap: StringDict;
  pictureMap: StringDict;
}> {
  public state = {
    game: null as any,
    isIntroPlaying: false,
    localAnswer: '',
    localWager: '',
    localAnswerSubmitted: false,
    localWagerSubmitted: false,
    categoryMask: Array(6).fill(true),
    categoryReadTime: 0,
    clueMask: {} as any,
    readingDisabled: false,
  };
  async componentDidMount() {
    this.setState({
      readingDisabled: Boolean(
        window.localStorage.getItem('jeopardy-readingDisabled')
      ),
    });
    this.props.socket.emit('JPD:init');
    this.props.socket.on('JPD:state', (game: any) => {
      this.setState({ game });
    });
    this.props.socket.on('JPD:playIntro', () => {
      this.playIntro();
    });
    this.props.socket.on('JPD:playTimesUp', () => {
      new Audio('/jeopardy/jeopardy-times-up.mp3').play();
    });
    this.props.socket.on('JPD:playDailyDouble', () => {
      new Audio('/jeopardy/jeopardy-daily-double.mp3').play();
    });
    this.props.socket.on('JPD:playFinalJeopardy', () => {
      new Audio('/jeopardy/jeopardy-think.mp3').play();
    });
    this.props.socket.on('JPD:playRightanswer', () => {
      new Audio('/jeopardy/jeopardy-rightanswer.mp3').play();
    });
    this.props.socket.on('JPD:playClue', async (qid: string, text: string) => {
      this.setState({
        localAnswer: '',
        localWager: '',
        localWagerSubmitted: false,
        localAnswerSubmitted: false,
      });
      // Read the question
      // console.log('JPD:playClue', text);
      await this.sayText(text);
    });
    this.props.socket.on('JPD:playCategories', async () => {
      const now = Number(new Date());
      const clueMask: any = {};
      const clueMaskOrder = [];
      for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 5; j++) {
          clueMask[`${i}_${j}`] = true;
          clueMaskOrder.push(`${i}_${j}`);
        }
      }
      this.setState({
        categoryMask: Array(6).fill(false),
        categoryReadTime: now,
        clueMask,
      });
      // Run board intro sequence
      // Play the fill sound
      new Audio('/jeopardy/jeopardy-board-fill.mp3').play();
      // Randomly choose ordering of the 30 clues
      // Split into 6 sets of 5
      // Each half second show another set of 5
      shuffle(clueMaskOrder);
      const clueSets = [];
      for (let i = 0; i < clueMaskOrder.length; i += 5) {
        clueSets.push(clueMaskOrder.slice(i, i + 5));
      }
      for (let i = 0; i < clueSets.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        clueSets[i].forEach((clue) => delete this.state.clueMask[clue]);
        this.setState({ clueMask: this.state.clueMask });
      }
      // Reveal and read categories
      const categories = this.getCategories();
      await this.sayText('Here are the categories.');
      for (let i = 0; i < this.state.categoryMask.length; i++) {
        if (this.state.categoryReadTime !== now) {
          continue;
        }
        let newMask: Boolean[] = [...this.state.categoryMask];
        newMask[i] = true;
        this.setState({ categoryMask: newMask });
        await this.sayText(categories[i]);
      }
    });
  }

  async componentDidUpdate(prevProps: any, prevState: any) {}

  newGame = async (episode: number | null, filter: string | null) => {
    this.setState({ game: null });
    // optionally send an episode number
    this.props.socket.emit('JPD:start', episode, filter);
  };

  playIntro = async () => {
    this.setState({ isIntroPlaying: true });
    document.getElementById('intro')!.innerHTML = '';
    let introVideo = document.createElement('video');
    let introMusic = new Audio('/jeopardy/jeopardy-intro-full.ogg');
    document.getElementById('intro')?.appendChild(introVideo);
    introVideo.muted = true;
    introVideo.src = '/jeopardy/jeopardy-intro-video.mp4';
    introVideo.play();
    introMusic.volume = 0.5;
    introMusic.play();
    setTimeout(async () => {
      await this.sayText('This is Jeopardy!');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.sayText("Here are today's contestants.");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      for (let i = 0; i < this.props.participants.length; i++) {
        const p = this.props.participants[i];
        const name = this.props.nameMap[p.id];
        const player = document.createElement('img');
        player.src =
          getDefaultPicture(this.props.nameMap[p.id], getColorHex(p.id)) ||
          this.props.pictureMap[p.id];
        player.style.width = '200px';
        player.style.height = '200px';
        player.style.position = 'absolute';
        player.style.margin = 'auto';
        player.style.top = '0px';
        player.style.bottom = '0px';
        player.style.left = '0px';
        player.style.right = '0px';
        document.getElementById('intro')!.appendChild(player);
        // maybe we can look up the location by IP?
        await this.sayText('A person from somewhere, ' + name);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        document.getElementById('intro')!.removeChild(player);
      }
    }, 10000);
    setTimeout(() => {
      introMusic.pause();
      introVideo.pause();
      introVideo = null as any;
      introMusic = null as any;
      document.getElementById('intro')!.innerHTML = '';
      this.setState({ isIntroPlaying: false });
    }, 38500);
  };

  sayText = async (text: string) => {
    await new Promise((resolve) => {
      if (this.state.readingDisabled) {
        return resolve();
      }
      window.speechSynthesis.cancel();
      const utterThis = new SpeechSynthesisUtterance(text);
      // let retryCount = 0;
      // while (speechSynthesis.getVoices().length === 0 && retryCount < 5) {
      //   retryCount += 1;
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      // }
      // let voices = speechSynthesis.getVoices();
      // let target = voices.find(
      //   (voice) => voice.name === 'Google UK English Male'
      // );
      // if (target) {
      //   utterThis.voice = target;
      // }
      window.speechSynthesis.speak(utterThis);
      utterThis.onend = resolve;
      utterThis.onerror = resolve;
    });
  };

  pickQ = (id: string) => {
    this.props.socket.emit('JPD:pickQ', id);
  };

  submitWager = () => {
    this.props.socket.emit('JPD:wager', this.state.localWager);
    this.setState({ localWager: '', localWagerSubmitted: true });
  };

  submitAnswer = (answer = null) => {
    this.props.socket.emit(
      'JPD:answer',
      this.state.game?.currentQ,
      answer || this.state.localAnswer
    );
    this.setState({ localAnswer: '', localAnswerSubmitted: true });
  };

  judgeAnswer = (id: string, correct: boolean) => {
    this.props.socket.emit('JPD:judge', { id, correct });
  };

  getCategories = () => {
    const game = this.state.game;
    if (!game) {
      return [];
    }
    let categories: string[] = Array(6).fill('');
    Object.keys(game.board).forEach((key) => {
      const col = Number(key.split('_')[0]) - 1;
      categories[col] = game.board[key].category;
    });
    return categories;
  };

  getWinners = () => {
    const max = Math.max(...Object.values<number>(this.state.game.scores)) || 0;
    return this.props.participants
      .filter((p) => (this.state.game.scores[p.id] || 0) === max)
      .map((p) => p.id);
  };

  render() {
    const game = this.state.game;
    const categories = this.getCategories();
    return (
      <React.Fragment>
        <div id="intro" />
        {Boolean(game) && !this.state.isIntroPlaying && (
          <div style={{ position: 'relative' }}>
            {Boolean(game) && game.round === 'end' && (
              <div id="endgame">
                <h1 style={{ color: 'white' }}>Winner!</h1>
                {this.getWinners().map((winner: string) => (
                  <img
                    alt=""
                    style={{ width: '200px', height: '200px' }}
                    src={
                      getDefaultPicture(
                        this.props.nameMap[winner],
                        getColorHex(winner)
                      ) || this.props.pictureMap[winner]
                    }
                  />
                ))}
              </div>
            )}
            {Boolean(game.currentQ) && (
              <div
                className="clueContainer"
                style={{
                  backgroundSize: 'cover',
                  backgroundImage:
                    game.currentDailyDouble && game.waitingForWager
                      ? `url(/jeopardy/jeopardy-daily-double.png)`
                      : undefined,
                }}
              >
                <div className="category" style={{ height: '30px' }}>
                  {game.board[game.currentQ] &&
                    game.board[game.currentQ].category}
                </div>
                <div className="category" style={{ height: '30px' }}>
                  {Boolean(game.currentValue) && game.currentValue}
                </div>
                {
                  <div className={`clue`}>
                    {game.board[game.currentQ] &&
                      game.board[game.currentQ].question}
                  </div>
                }
                <div className="" style={{ height: '60px' }}>
                  {!game.currentAnswer &&
                  !game.buzzes[this.props.socket.id] &&
                  !game.submitted[this.props.socket.id] &&
                  !game.currentDailyDouble ? (
                    <div style={{ display: 'flex' }}>
                      <Button
                        disabled={!game.canBuzz}
                        color="green"
                        size="huge"
                        onClick={() => this.props.socket.emit('JPD:buzz')}
                        icon
                        labelPosition="left"
                      >
                        <Icon name="lightbulb" />
                        Buzz
                      </Button>
                      <Button
                        disabled={!game.canBuzz}
                        color="red"
                        size="huge"
                        onClick={() => this.submitAnswer(null)}
                        icon
                        labelPosition="left"
                      >
                        <Icon name="close" />
                        Pass
                      </Button>
                    </div>
                  ) : null}
                  {!game.currentAnswer &&
                  !this.state.localAnswerSubmitted &&
                  game.buzzes[this.props.socket.id] &&
                  game.questionDuration ? (
                    <Input
                      autoFocus
                      label="Answer"
                      value={this.state.localAnswer}
                      onChange={(e) =>
                        this.setState({ localAnswer: e.target.value })
                      }
                      onKeyPress={(e: any) =>
                        e.key === 'Enter' && this.submitAnswer()
                      }
                      icon={
                        <Icon
                          onClick={this.submitAnswer}
                          name="arrow right"
                          inverted
                          circular
                          link
                        />
                      }
                    />
                  ) : null}
                  {game.waitingForWager &&
                  game.waitingForWager[this.props.socket.id] ? (
                    <Input
                      label="Wager"
                      value={this.state.localWager}
                      onChange={(e) =>
                        this.setState({ localWager: e.target.value })
                      }
                      onKeyPress={(e: any) =>
                        e.key === 'Enter' && this.submitWager()
                      }
                      icon={
                        <Icon
                          onClick={this.submitWager}
                          name="arrow right"
                          inverted
                          circular
                          link
                        />
                      }
                    />
                  ) : null}
                </div>
                <div className={`answer`} style={{ height: '30px' }}>
                  {game.currentAnswer}
                </div>
                {Boolean(game.playClueDuration) && (
                  <TimerBar duration={game.playClueDuration} />
                )}
                {Boolean(game.questionDuration) && (
                  <TimerBar duration={game.questionDuration} />
                )}
                <div style={{ position: 'absolute', top: '0px', right: '0px' }}>
                  <Button
                    onClick={() => this.props.socket.emit('JPD:skipQ')}
                    icon
                    labelPosition="left"
                  >
                    <Icon name="forward" />
                    Next Question
                  </Button>
                </div>
              </div>
            )}
            {!Boolean(game.currentQ) && (
              <div className="board">
                {categories.map((cat, i) => (
                  <div className="category box">
                    {this.state.categoryMask[i] ? cat : ''}
                  </div>
                ))}
                {Array.from(Array(5)).map((_, i) => {
                  return (
                    <React.Fragment>
                      {categories.map((cat, j) => {
                        const id = `${j + 1}_${i + 1}`;
                        const clue = game.board[id];
                        return (
                          <div
                            onClick={clue ? () => this.pickQ(id) : undefined}
                            className={`${clue ? 'value' : ''} box`}
                          >
                            {!this.state.clueMask[id] && clue ? clue.value : ''}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            <div style={{ height: '8px' }} />
            <div style={{ display: 'flex' }}>
              {this.props.participants.map((p) => {
                return (
                  <div className="scoreboard">
                    <div className="picture" style={{ position: 'relative' }}>
                      <img
                        alt=""
                        src={
                          this.props.pictureMap[p.id] ||
                          getDefaultPicture(
                            this.props.nameMap[p.id],
                            getColorHex(p.id)
                          )
                        }
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '0px',
                          width: '100%',
                          backgroundColor: '#' + getColorHex(p.id),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                        }}
                      >
                        <div
                          title={this.props.nameMap[p.id] || p.id}
                          style={{
                            width: '100%',
                            backdropFilter: 'brightness(80%)',
                            padding: '4px',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            display: 'inline-block',
                          }}
                        >
                          {this.props.nameMap[p.id] || p.id}
                        </div>
                      </div>
                      {p.id in game.wagers ? (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '0px',
                          }}
                        >
                          <Label title="Wager" circular size="tiny">
                            {game.wagers[p.id] || 0}
                          </Label>
                        </div>
                      ) : null}
                      <div className="icons">
                        {!game.picker || game.picker === p.id ? (
                          <Icon
                            title="Controlling the board"
                            name="pointing up"
                          />
                        ) : null}
                        {game.skips[p.id] ? (
                          <Icon title="Voted to skip" name="forward" />
                        ) : null}
                      </div>
                      {p.id === game.currentJudgeAnswer ? (
                        <div className="judgeButtons">
                          <Button
                            onClick={() => this.judgeAnswer(p.id, true)}
                            color="green"
                            size="tiny"
                            icon
                            fluid
                          >
                            <Icon name="check" />
                          </Button>
                          <Button
                            onClick={() => this.judgeAnswer(p.id, false)}
                            color="red"
                            size="tiny"
                            icon
                            fluid
                          >
                            <Icon name="close" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <div
                      className={`points ${
                        game.scores[p.id] < 0 ? 'negative' : ''
                      }`}
                    >
                      {(game.scores[p.id] || 0).toLocaleString()}
                    </div>
                    <div
                      className={`answerBox ${game.buzzes[p.id] ? 'buzz' : ''}`}
                    >
                      {game && game.answers[p.id]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div
          className="title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'white',
            padding: '10px',
          }}
        >
          <Button
            onClick={() => this.props.socket.emit('JPD:cmdIntro')}
            icon
            labelPosition="left"
          >
            <Icon name="film" />
            Play Intro
          </Button>
          <Dropdown
            button
            className="icon"
            labeled
            icon="certificate"
            text="New Game"
          >
            <Dropdown.Menu>
              {[
                { key: 'all', value: null, text: 'Any' },
                { key: 'kids', value: 'kids', text: 'Kids Week' },
                { key: 'teen', value: 'teen', text: 'Teen Tournament' },
                {
                  key: 'college',
                  value: 'college',
                  text: 'College Championship',
                },
                {
                  key: 'celebrity',
                  value: 'celebrity',
                  text: 'Celebrity Jeopardy',
                },
                {
                  key: 'teacher',
                  value: 'teacher',
                  text: 'Teachers Tournament',
                },
              ].map((item) => (
                <Dropdown.Item
                  key={item.key}
                  onClick={() => this.newGame(null, item.value)}
                >
                  {item.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <div className="logo">Jeopardy!</div>
          {game && game.epNum && <div>{'#' + game.epNum}</div>}
          {game && game.info && <div>({game.info})</div>}
          {game && game.airDate && (
            <div>{new Date(game.airDate + 'T00:00').toDateString()}</div>
          )}
          <div style={{ display: 'flex' }}>
            <Checkbox
              toggle
              onChange={() => {
                const checked = !this.state.readingDisabled;
                this.setState({ readingDisabled: checked });
                if (checked) {
                  window.localStorage.setItem('jeopardy-readingDisabled', '1');
                } else {
                  window.localStorage.removeItem('jeopardy-readingDisabled');
                }
              }}
              checked={this.state.readingDisabled}
            />
            <div
              style={{ color: 'white', fontSize: '12px', marginLeft: '4px' }}
            >
              Disable reading
            </div>
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre
            style={{ color: 'white', maxHeight: '200px', overflow: 'scroll' }}
          >
            {JSON.stringify(game, null, 2)}
          </pre>
        )}
      </React.Fragment>
    );
  }
}

class TimerBar extends React.Component<{ duration: number }> {
  public state = { width: '0%' };
  componentDidMount() {
    requestAnimationFrame(() => {
      this.setState({ width: '100%' });
    });
  }
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '0px',
          left: '0px',
          height: '10px',
          width: this.state.width,
          backgroundColor: '#0E6EB8',
          transition: `${this.props.duration / 1000}s width linear`,
        }}
      />
    );
  }
}
