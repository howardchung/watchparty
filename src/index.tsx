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

const Debug = lazy(() => import('./components/Debug/Debug'));

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Route
        path="/"
        exact
        render={(props) => {
          if (props.location?.hash) {
            return <App />;
          }
          return (
            <React.Fragment>
              <TopBar hideNewRoom hideSignin />
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
          return <App vanity={props.match.params.vanity} />;
        }}
      />
      <Route path="/terms">
        <TopBar hideNewRoom hideSignin />
        <Terms />
        <Footer />
      </Route>
      <Route path="/privacy">
        <TopBar hideNewRoom hideSignin />
        <Privacy />
        <Footer />
      </Route>
      <Route path="/faq">
        <TopBar hideNewRoom hideSignin />
        <FAQ />
        <Footer />
      </Route>
      <Route path="/debug">
        <TopBar hideNewRoom hideSignin />
        <Suspense fallback={null}>
          <Debug />
        </Suspense>
        <Footer />
      </Route>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
