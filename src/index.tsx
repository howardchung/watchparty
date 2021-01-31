import './index.css';
import 'semantic-ui-css/semantic.min.css';

import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './components/App';
import { Home } from './components/Home';
import { Privacy, Terms, FAQ } from './components/PrivacyTerms/PrivacyTerms';
import { TopBar } from './components/TopBar/TopBar';
import { Footer } from './components/Footer/Footer';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';
import 'firebase/auth';

const Debug = lazy(() => import('./components/Debug/Debug'));

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG;
if (firebaseConfig) {
  firebase.initializeApp(JSON.parse(firebaseConfig));
}

class WatchParty extends React.Component {
  public state = {
    user: undefined,
  };
  async componentDidMount() {
    if (firebaseConfig) {
      firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
        if (user) {
          // console.log(user);
          this.setState({ user });
        }
      });
    }
  }
  render() {
    return (
      <React.StrictMode>
        <BrowserRouter>
          <Route
            path="/"
            exact
            render={(props) => {
              if (props.location?.hash) {
                return <App user={this.state.user} />;
              }
              return (
                <React.Fragment>
                  <TopBar user={this.state.user} hideNewRoom />
                  <Home />
                  <Footer />
                </React.Fragment>
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
                  vanity={props.match.params.vanity}
                />
              );
            }}
          />
          <Route path="/terms">
            <TopBar user={this.state.user} />
            <Terms />
            <Footer />
          </Route>
          <Route path="/privacy">
            <TopBar user={this.state.user} />
            <Privacy />
            <Footer />
          </Route>
          <Route path="/faq">
            <TopBar user={this.state.user} />
            <FAQ />
            <Footer />
          </Route>
          <Route path="/debug">
            <TopBar user={this.state.user} />
            <Suspense fallback={null}>
              <Debug />
            </Suspense>
            <Footer />
          </Route>
        </BrowserRouter>
      </React.StrictMode>
    );
  }
}
ReactDOM.render(<WatchParty />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
