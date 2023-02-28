import './index.css';

import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './components/App';
import { Home } from './components/Home';
import { Privacy, Terms, FAQ } from './components/PrivacyTerms/PrivacyTerms';
import { TopBar } from './components/TopBar/TopBar';
import { Footer } from './components/Footer/Footer';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import { serverPath } from './utils';
import { Modal } from 'semantic-ui-react';
import { Create } from './components/Create/Create';

const Debug = lazy(() => import('./components/Debug/Debug'));

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG;
if (firebaseConfig) {
  firebase.initializeApp(JSON.parse(firebaseConfig));
}

class WatchParty extends React.Component {
  public state = {
    user: undefined as firebase.User | undefined,
    isSubscriber: false,
    isCustomer: false,
    streamPath: undefined as string | undefined,
    beta: false,
    isCustomDomain: false,
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
            isCustomDomain: data.isCustomDomain,
          });
        }
      });
    }
  }
  render() {
    return (
      <>
        {this.state.isCustomDomain && (
          <Modal inverted basic open>
            <Modal.Header>
              Please contact Howard for access to beta/testing mode.
            </Modal.Header>
          </Modal>
        )}
        <BrowserRouter>
          <Route
            path="/"
            exact
            render={(props) => {
              if (props.location?.hash) {
                return (
                  <App
                    user={this.state.user}
                    isSubscriber={this.state.isSubscriber}
                    isCustomer={this.state.isCustomer}
                    streamPath={this.state.streamPath}
                    beta={this.state.beta}
                  />
                );
              }
              return (
                <React.Fragment>
                  <TopBar
                    user={this.state.user}
                    isSubscriber={this.state.isSubscriber}
                    isCustomer={this.state.isCustomer}
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
            path="/r/:vanity"
            exact
            render={(props) => {
              return (
                <App
                  user={this.state.user}
                  isSubscriber={this.state.isSubscriber}
                  isCustomer={this.state.isCustomer}
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
              isCustomer={this.state.isCustomer}
            />
            <Terms />
            <Footer />
          </Route>
          <Route path="/privacy">
            <TopBar
              user={this.state.user}
              isSubscriber={this.state.isSubscriber}
              isCustomer={this.state.isCustomer}
            />
            <Privacy />
            <Footer />
          </Route>
          <Route path="/faq">
            <TopBar
              user={this.state.user}
              isSubscriber={this.state.isSubscriber}
              isCustomer={this.state.isCustomer}
            />
            <FAQ />
            <Footer />
          </Route>
          <Route path="/debug">
            <TopBar
              user={this.state.user}
              isSubscriber={this.state.isSubscriber}
              isCustomer={this.state.isCustomer}
            />
            <Suspense fallback={null}>
              <Debug />
            </Suspense>
            <Footer />
          </Route>
        </BrowserRouter>
      </>
    );
  }
}
ReactDOM.render(<WatchParty />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
