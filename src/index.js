import './index.css';
import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { JeopardyHome } from './components/Home/Home';

const isHome = !Boolean(window.location.hash.substring(1));
ReactDOM.render(
  <React.StrictMode>{isHome ? <JeopardyHome /> : <App />}</React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
