import React from 'react';
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import { CookiesProvider } from "react-cookie";

import AppLayout from "../src/shared/layouts/AppLayout";
import ReactGA from 'react-ga';
import { GOOGLE_ANALYTICS_TRACKINGID } from './config/api.config';
function initializeAnalytics()
{
  ReactGA.initialize(GOOGLE_ANALYTICS_TRACKINGID);
  ReactGA.pageview('/');
}
function App() {
  initializeAnalytics();
  return (
    <div className="App">
      <CookiesProvider>
        <AppLayout />
      </CookiesProvider>
    </div>
  );
}
export default App;
