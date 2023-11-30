////////////////////////
// Google Analytics
////////////////////////
// Script that holds on to a visitor and is referenced when a visitor makes a action

//TODO: WIP Script

import settings from 'data/initialSettings';
import os from 'os';
import { ipcRenderer } from 'electron';

const GA = {};

GA.visitor = null;
GA.active = false;

// Send Screen
// Send A Screen Event to Google, this is like a url hit for websites
// Input :
//     ScreenTitle || String || The Screen To Post
GA.SendScreen = function (ScreenTitle) {
  ipcRenderer.invoke('send-GA4-event', ScreenTitle);
};

// Send Event
// Send A regular event to google
// Input :
//     category || String || Event Category, grand scheme
//     action   || String || Event Action, group of events
//     label    || String || Event Label, The actual event being fired
//     value    || NonNegative Int || Event Value, must be NonNegative

GA.SendEvent = function (category, action, lable, value) {
  //GA.visitor.event(category, action, lable, value).send();
};

// Disable Analytics
// Turn off anayltics and destroys the old object
GA.DisableAnalytics = function () {
  ipcRenderer.invoke('remove-GA4', ScreenTitle);
  document.getElementById('gtag-loader').remove();
  document.getElementById('gtag-init').remove();
};

// Enable Analytics
// Turn on Analytics and create a new visitor
GA.EnableAnalytics = function () {
  addGTag();
};

GA.addGTag = function () {
  GA.active = true;
  const osVer = os.platform() + ' ' + os.release();
  var gtagLoader = document.createElement('script');
  gtagLoader.setAttribute('id', 'gtag-loader');
  gtagLoader.async = true;
  gtagLoader.src = 'https://www.googletagmanager.com/gtag/js?id=G-5CX0RT2KGY';
  gtagLoader.id = 'gtag-loader';
  gtagLoader.onload = () => {
    var gtagInit = document.createElement('script');
    gtagInit.id = 'gtag-init';
    gtagInit.innerHTML = `  window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
  
    gtag('config', 'G-5CX0RT2KGY',{'app_version': '${APP_VERSION}', 'os_version': '${osVer}', 'cpu_version' : '${
      os.cpus()[0].model
    }' } );`;

    document.documentElement.insertBefore(gtagInit, document.body);
    ipcRenderer.invoke('send-GA4-event', 'user_engagement');
  };
  document.documentElement.insertBefore(gtagLoader, document.body);
};

export default GA;
