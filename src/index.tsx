import './index.css';
import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './components/App';
import { Home } from './components/Home';
import { Privacy, Terms, FAQ } from './components/PrivacyTerms/PrivacyTerms';
import { TopBar } from './components/TopBar/TopBar';
import { Footer } from './components/Footer/Footer';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Route
        path="*"
        render={(props) =>
          props.location?.hash ? null : <TopBar hideNewRoom hideSignin />
        }
      />
      <Route
        path="/"
        exact
        render={(props) => {
          return props.location?.hash ? <App /> : <Home />;
        }}
      />
      <Route path="/terms">
        <Terms />
      </Route>
      <Route path="/privacy">
        <Privacy />
      </Route>
      <Route path="/faq">
        <FAQ />
      </Route>
      <Route
        path="*"
        render={(props) => (props.location?.hash ? null : <Footer />)}
      />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
