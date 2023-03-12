import './index.css';

import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './components/App';
import { Home } from './components/Home';
import { Privacy, Terms, FAQ, DiscordBot } from './components/Pages/Pages';
import { TopBar } from './components/TopBar/TopBar';
import { Footer } from './components/Footer/Footer';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import { serverPath } from './utils';
import { Create } from './components/Create/Create';
import { Discord } from './components/Discord/Discord';
import 'semantic-ui-css/semantic.min.css';

const Debug = lazy(() => import('./components/Debug/Debug'));

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG;
if (firebaseConfig) {
  firebase.initializeApp(JSON.parse(firebaseConfig));
}

// Redirect old-style URLs
if (window.location.hash) {
  const hashRoomId = window.location.hash.substring(1);
  window.location.href = '/watch/' + hashRoomId;
}

class WatchParty extends React.Component {
  public state = {
    user: undefined as firebase.User | undefined,
    isSubscriber: false,
    isCustomer: false,
    streamPath: undefined as string | undefined,
    beta: false,
  };
  async componentDidMount() {
    if (firebaseConfig) {
      firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
        if (user) {
          // console.log(user);
          this.setState({ user });
          const token = await user.getIdToken();
          const response = await window.fetch(
            serverPath + `/metadata?uid=${user.uid}&token=${token}`
          );
          const data = await response.json();
          this.setState({
            isSubscriber: data.isSubscriber,
            isCustomer: data.isCustomer,
            streamPath: data.streamPath,
            beta: data.beta,
          });
        }
      });
    }
  }
  render() {
    return (
      // <React.StrictMode>
      <BrowserRouter>
        <Route
          path="/"
          exact
          render={(props) => {
            return (
              <React.Fragment>
                <TopBar
                  user={this.state.user}
                  isSubscriber={this.state.isSubscriber}
                  hideNewRoom
                />
                <Home user={this.state.user} />
                <Footer />
              </React.Fragment>
            );
          }}
        />
        <Route
          path="/create"
          exact
          render={() => {
            return <Create user={this.state.user} />;
          }}
        />
        <Route
          path="/watch/:roomId"
          exact
          render={(props) => {
            return (
              <App
                user={this.state.user}
                isSubscriber={this.state.isSubscriber}
                urlRoomId={props.match.params.roomId}
                streamPath={this.state.streamPath}
                beta={this.state.beta}
              />
            );
          }}
        />
        <Route
          path="/r/:vanity"
          exact
          render={(props) => {
            return (
              <App
                user={this.state.user}
                isSubscriber={this.state.isSubscriber}
                vanity={props.match.params.vanity}
                streamPath={this.state.streamPath}
                beta={this.state.beta}
              />
            );
          }}
        />
        <Route path="/terms">
          <TopBar
            user={this.state.user}
            isSubscriber={this.state.isSubscriber}
          />
          <Terms />
          <Footer />
        </Route>
        <Route path="/privacy">
          <TopBar
            user={this.state.user}
            isSubscriber={this.state.isSubscriber}
          />
          <Privacy />
          <Footer />
        </Route>
        <Route path="/faq">
          <TopBar
            user={this.state.user}
            isSubscriber={this.state.isSubscriber}
          />
          <FAQ />
          <Footer />
        </Route>
        <Route path="/discordBot">
          <TopBar
            user={this.state.user}
            isSubscriber={this.state.isSubscriber}
          />
          <DiscordBot />
          <Footer />
        </Route>
        <Route path="/discord/auth" exact>
          <Discord user={this.state.user} />
        </Route>
        <Route path="/debug">
          <TopBar
            user={this.state.user}
            isSubscriber={this.state.isSubscriber}
          />
          <Suspense fallback={null}>
            <Debug />
          </Suspense>
          <Footer />
        </Route>
      </BrowserRouter>
      // </React.StrictMode>
    );
  }
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<WatchParty />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
