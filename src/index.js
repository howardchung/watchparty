import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import { Home } from './components/Home';
import * as serviceWorker from './serviceWorker';

const isHome = !Boolean(window.location.hash.substring(1));
ReactDOM.render(
  <React.StrictMode>{isHome ? <Home /> : <App />}</React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
