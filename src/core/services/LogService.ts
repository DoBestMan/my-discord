import { ipcRenderer, remote } from 'electron';
import React from 'react';
import Swal from 'sweetalert2';
import api from '../../config/api_config';

const ready = async (webview, account) => {
  let currentChannelId;

  const ackMessageHandler = async (
    myCurrentUrl,
    myAuthorization,
    responseUrl
  ) => {
    console.log(333444, responseUrl);
    if (
      myCurrentUrl.substring(myCurrentUrl.lastIndexOf('/') + 1) !== 'app'
      //  &&
      // myCurrentUrl
      //   .substring(myCurrentUrl.lastIndexOf('/') + 1)
      //   .includes('login') == -1
    ) {
      if (responseUrl == 'ack') {
        await fetch(
          'https://discord.com/api/v9/channels/' +
            myCurrentUrl.substring(myCurrentUrl.lastIndexOf('/') + 1) +
            '/messages?limit=50',
          {
            headers: {
              accept: '*/*',
              'accept-language': 'en-US,en;q=0.9',
              authorization: myAuthorization,
              'sec-ch-ua':
                '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'x-debug-options': 'bugReporterEnabled',
              'x-discord-locale': 'en-US',
              'x-super-properties':
                'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMC4wLjQ4OTYuMTI3IFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIxMDAuMC40ODk2LjEyNyIsIm9zX3ZlcnNpb24iOiIxMCIsInJlZmVycmVyIjoiaHR0cHM6Ly9kaXNjb3JkLmNvbS8iLCJyZWZlcnJpbmdfZG9tYWluIjoiZGlzY29yZC5jb20iLCJyZWZlcnJlcl9jdXJyZW50IjoiaHR0cHM6Ly9kaXNjb3JkLmNvbS8iLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiJkaXNjb3JkLmNvbSIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEyNTcyMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
            },
            referrer: myCurrentUrl,
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
          }
        )
          .then((response) => response.json())
          .then((res) => {
            messageHandler(res);
          });
      } else {
        await fetch(responseUrl, {
          headers: {
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.9',
            authorization: myAuthorization,
            'sec-ch-ua':
              '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-super-properties':
              'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMC4wLjQ4OTYuMTI3IFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIxMDAuMC40ODk2LjEyNyIsIm9zX3ZlcnNpb24iOiIxMCIsInJlZmVycmVyIjoiaHR0cHM6Ly9kaXNjb3JkLmNvbS8iLCJyZWZlcnJpbmdfZG9tYWluIjoiZGlzY29yZC5jb20iLCJyZWZlcnJlcl9jdXJyZW50IjoiaHR0cHM6Ly9kaXNjb3JkLmNvbS8iLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiJkaXNjb3JkLmNvbSIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEyNTcyMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
          },
          referrer: responseUrl,
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        })
          .then((response) => response.json())
          .then((res) => {
            messageHandler(res);
          });
      }
    }
  };

  const messageHandler = (responseBody) => {
    saveLog(responseBody);
  };
  const saveLog = (payloadData) => {
    if (
      (payloadData.length == undefined && payloadData.id != undefined) ||
      (payloadData[0].id && payloadData.length > 0)
    ) {
      console.log(998, payloadData);
      console.log(200, localStorage.getItem('myNameinDiscord'));
      console.log(201, localStorage.getItem('myWorkspace'));
      console.log(202, localStorage.getItem('myChannel'));

      const message = {
        orgID: account.orgID,
        name: account.name,
        discordName: localStorage.getItem('myNameinDiscord'),
        discordWorkspace: localStorage.getItem('myWorkspace'),
        discordChannel: localStorage.getItem('myChannel'),
        mainBody: payloadData,
      };
      console.log(999, message);
      api.logMessage(message).catch(() => {
        console.log('676');
        // Swal.fire('Failed to log message.', 'error');
      });
    }
  };

  const webContentsId = webview.getWebContentsId();
  const curWebContents = remote.webContents.fromId(webContentsId);

  try {
    curWebContents.debugger.attach('1.2');
  } catch (err) {
    console.log('Debugger attach failed : ', err);
  }

  curWebContents.debugger.on('detach', (event, reason) => {});

  curWebContents.debugger.on('message', (event, method, params) => {
    if (
      'XHR' === params.type &&
      method === 'Network.responseReceived' &&
      true === params.response.url.includes('https://') &&
      (true === params.response.url.includes('messages') ||
        true === params.response.url.includes('/ack'))
    ) {
      if (true === params.response.url.includes('/ack')) {
        ackMessageHandler(
          params.response.requestHeaders.referer,
          params.response.requestHeaders.authorization,
          'ack'
        );
        const webContentsId = webview.getWebContentsId();
        const webContents = remote.webContents.fromId(webContentsId);
        webContents.send('getMyName');
        const ppp = webview.send('getMyName');
      } else {
        ackMessageHandler(
          params.response.requestHeaders.referer,
          params.response.requestHeaders.authorization,
          params.response.url
        );
        const webContentsId = webview.getWebContentsId();
        const webContents = remote.webContents.fromId(webContentsId);
        webContents.send('getMyName');
        const ppp = webview.send('getMyName');
      }
    }
  });
  curWebContents.debugger.sendCommand('Network.enable');
};

export default ready;
