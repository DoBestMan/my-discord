import React, { useState, useEffect } from 'react';
import { ipcRenderer, remote, WebviewTag } from 'electron';
import { RootStateOrAny, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import path from 'path';
import error from '../../../assets/500.png';
import { EventListener } from '../../core';
import { socket } from '../login/Login';
import { DISCORD_LOGIN, DISCORD_FIRST } from '../../shared/constants/urls';
import { current } from '@reduxjs/toolkit';
const fs = require('fs');

const Home = () => {
  const [connected, setConnected] = useState(true);

  const [proxied, setProxied] = useState(false);
  const account: any = useSelector(
    (state: RootStateOrAny) => state.login.account
  );
  const user: any = useSelector((state: RootStateOrAny) => state.login.user);
  const myName: any = useSelector(
    (state: RootStateOrAny) => state.login.myName
  );

  const email: any = useSelector((state: RootStateOrAny) => state.login.email);
  const proxy: any = useSelector((state: RootStateOrAny) => state.login.proxy);
  const injectJs: string = useSelector(
    (state: RootStateOrAny) => state.login.injectJs
  );

  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(4713033, arg);
  }); // Async message handler

  // ipcRenderer.on('getMyName', (event, arg) => {
  //   console.log(20220627, '20220627');
  //   // console.log(20220627,store.get('currentName'));
  //   console.log(9876543, arg);
  //   console.log(20220627, '20220627');
  //   //     console.log(20220627, data);
  //   //     console.log(localStorage.getItem('myNameInPreload'));
  // }); // Async message handler

  // ipcRenderer.on('getMyNameHost', (event, arg) => {
  //   console.log(20220627, '20220627');
  //   // console.log(20220627,store.get('currentName'));
  //   console.log(9876543, arg);
  //   console.log(20220627, '20220627');
  //   //     console.log(20220627, data);
  //   //     console.log(localStorage.getItem('myNameInPreload'));
  // }); // Async message handler

  useEffect(() => {
    const webview: WebviewTag = document.getElementById(
      'webview'
    ) as WebviewTag;

    console.log(20230213, `myName`, myName);

    const spinner: HTMLElement = document.getElementById(
      'spinner'
    ) as HTMLElement;

    const preloadPath = `file://${path.resolve(
      'resources/assets/js/webview-preload.js'
    )}`;
    if (webview !== null) {
      webview.preload = preloadPath;

      // inject preload.js from server

      webview?.addEventListener('dom-ready', (event) => {
        const webContentsId = webview.getWebContentsId();
        const curWebContents = remote.webContents.fromId(webContentsId);
        curWebContents.send('getCredit', user);
        // webview.openDevTools();
        if (injectJs) {
          webview.executeJavaScript(injectJs).catch((e) => {
            Swal.fire(
              'Opps!',
              "Discord can't work. please contact administrator.",
              'error'
            );
            setTimeout(() => {
              ipcRenderer.send('closed');
            }, 5000);
          });
        }
      });
    }

    const loadstart = async (event, src) => {
      spinner.style.display = 'flex';
      const currentURL = webview.getURL();
      console.log(20230213, `currentURL`, currentURL);
      console.log(20230213, `src`, src);
      console.log(20230213, `eventsrc`, event.src);
      console.log(20230213, `event`, event);
      // webview.style.display = 'none';
    };

    const loadstop = async (event, src) => {
      const currentURL = webview.getURL();
      console.log(20230213, `currentURL`, currentURL);
      console.log(20230213, `src`, src);
      console.log(20230213, `event`, event);
      if (currentURL.includes('https://discord.com/channels/@me/')) {
        // ipcRenderer.send('asynchronous-message-channel', 'getMyName');
        console.log(20220627, '20220627');
      }
      spinner.style.display = 'none';
    };

    webview?.addEventListener('did-start-loading', loadstart);
    webview?.addEventListener('did-stop-loading', loadstop);
    webview?.addEventListener('did-stop-loading', loadstop);

    // const _openInExternal = function (link) {
    //   console.log(20230213, `_openInExternal`, link);

    //   let protocol = url.parse(link).protocol;
    //   if (protocol === 'http:' || protocol === 'https:') {
    //     shell.openExternal(link);
    //     return true;
    //   } else {
    //     return false;
    //   }
    // };

    webview?.addEventListener('will-navigate', (e) => {
      console.log(20230213, `will-navigate`, e);
      if (!e.url.startsWith(`https://discord.com/`)) {
        console.log(20230213, `prevent default`);
        // e.preventDefault();
        webview.stop();
      }
      // if (_openInExternal(e.url)) {
      //   console.log(20230213, `webview.stop`, e.url);
      //   console.log(20230213, `webview.stop`, _openInExternal(e.url));

      //   webview.stop();
      // }
    });

    webview?.addEventListener('ipc-message', (event, data) => {
      if (event.channel === 'redirect') {
        webview.loadURL(DISCORD_FIRST);
      } else if (event.channel === 'check-mail') {
        Swal.fire(
          'Autherntication Error',
          'You are trying to use an unauthorized Email',
          'error'
        );
      } else if (event.channel === 'wrong-user') {
        Swal.fire(
          'Autherntication Error',
          'You are trying to use an unauthorized Account',
          'error'
        );
      } else if (event.channel === 'getMyNameHost') {
        console.log(20220627, '20220627');
        console.log(20220627, data);
        console.log(148, event);
        console.log(148, event.args[0]);
        localStorage.setItem('myNameinDiscord', event.args[0][0]);
        localStorage.setItem('myWorkspace', event.args[0][1]);
        localStorage.setItem('myChannel', event.args[0][2]);
        console.log(150, localStorage.getItem('myNameinDiscord'));
        console.log(149, localStorage.getItem('myWorkspace'));
        console.log(148, localStorage.getItem('myChannel'));

        ipcRenderer.on('getMyName', function (event, arg) {
          console.log(20220627, '20220627');
          console.log(15975, arg);
          console.log(147, localStorage.getItem('myNameInPreload'));
        });
      }
    });

    EventListener.default(webview, account);

    socket.on('connect', function () {
      setConnected(socket.connected);
    });
    socket.on('disconnect', function () {
      setConnected(socket.connected);
    });
  }, [connected]);

  return (
    <div>
      {connected ? (
        <div>
          <webview
            id="webview"
            partition={'persist:' + myName}
            src={DISCORD_FIRST}
            style={{ width: '100%', height: '100vh' }}
          ></webview>
          <div id="spinner" className="spinner">
            <div className="doubleBounce1"></div>
            <div className="doubleBounce2"></div>
          </div>
        </div>
      ) : (
        <img
          src={error}
          alt="Connect to server error"
          style={{ width: '100%', height: '101vh' }}
        />
      )}
    </div>
  );
};

export default Home;
