import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "./assets/scss/app.scss";
import * as serviceWorker from './serviceWorker';
import { Provider as ReduxProvider } from 'react-redux';
import store from './store';

import { BaseProvider, LightTheme } from 'baseui';
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";


const engine = new Styletron(); ReactDOM.render(
  <ReduxProvider store={store}>
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <App />
      </BaseProvider>
    </StyletronProvider>
  </ReduxProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
