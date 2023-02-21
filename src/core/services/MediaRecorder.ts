import React from 'react';
import { ipcRenderer, BrowserWindow, desktopCapturer } from 'electron';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';
import api from '../../config/api_config';

const blobToBase64 = (blob) => {
  const fReader = new FileReader();
  fReader.readAsDataURL(blob);
  return new Promise((resolve) => {
    fReader.onloadend = () => {
      resolve(fReader.result);
    };
  });
};

const self = JSON.parse(window.localStorage.getItem('self'));
const team = JSON.parse(window.localStorage.getItem('team'));

const record = (account) => {
  let recorder;
  let callId = null;
  const maxCallTime = 60 * 60 * 1000;
  const intervalChunkSend = 1000;
  const intervalRequestChunk = 100;

  let resultInitedStream = false;
  let timerRequestData = null;
  let timerAutoEndCall = null;
  let timerSendChunkToServer = null;

  const initStream = async () => {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
    });
    const videoSource = inputSources.find(
      (source) =>
        source.name === 'Electron' ||
        source.name === 'electron-react-boilerplate'
    );

    const mimeType = 'video/webm; codecs=vp9';
    // const mimeType = "audio/webm; codecs=opus";
    const streamChunks = [];

    const constraints = {
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: videoSource.id,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: videoSource.id,
        },
      },
    };

    const options = { mimeType: mimeType };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      recorder = new MediaRecorder(stream, options);

      const maxStreamChunkLength =
        intervalChunkSend / intervalRequestChunk + 20;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          if (streamChunks.length > maxStreamChunkLength) {
            Swal.fire(
              'Closed Calling',
              'Sorry, Calling must be broken because Discord App server takes the high traffic load',
              'warning'
            );
            stopCall();
          } else {
            streamChunks.push(event.data);
          }
        }
      };

      // send automatically chunks to the server.
      timerSendChunkToServer = setInterval(async () => {
        // if call window closed
        ipcRenderer.send('check-call-window-closed');
        // if (BrowserWindow.getAllWindows().length === 1) {
        //   stopCall();
        // }

        const byteArray = streamChunks.splice(0, streamChunks.length);
        if (!callId || 0 === byteArray.length) {
          return;
        }

        const blob = new Blob(byteArray, {
          type: mimeType,
        });
        const fileDataUrl = await blobToBase64(blob);

        const data = {
          uri: fileDataUrl,
          fileName: callId,
          orgID: account.orgID,
          name: account.name,
          email: self.email,
          workspace: team.name,
        };

        api
          .logCall(data)
          .then()
          .catch((e) => {
            console.log(e);
            stopCall();
          });
      }, intervalChunkSend);

      resultInitedStream = true;
      return true;
    } catch (e) {
      Swal.fire(
        'Error Calling',
        "We can't process the call in this device.",
        'error'
      );

      // must stop the call.
      stopCall();
      return false;
    }
  };

  const startCall = () => {
    if (callId) {
      return;
    }
    if (!resultInitedStream) {
      stopCall();
      Swal.fire(
        'Error Calling',
        "We can't process the call on this device.",
        'error'
      );
      return;
    }

    // first off, generate calling id.
    const date = new Date(new Date().getTime() + 9 * 3600 * 1000);
    const s_y = date.getUTCFullYear() - 2000;
    const s_m = `0${date.getUTCMonth() + 1}`.slice(-2);
    const s_d = `0${date.getUTCDate()}`.slice(-2);
    const s_hh = `0${date.getUTCHours()}`.slice(-2);
    const s_mm = `0${date.getUTCMinutes()}`.slice(-2);
    const startTime = `${s_y}${s_m}${s_d}_${s_hh}${s_mm}`;
    callId = startTime;
    recorder.start();

    // chunk will be stored to the server per 100ms
    timerRequestData = setInterval(() => {
      recorder.requestData();
    }, intervalRequestChunk);

    timerAutoEndCall = setTimeout(() => {
      // call will be ended after 1 hour automatically
      stopCall();
    }, maxCallTime);
  };

  /**
   * Send a command to stop the calling
   */
  const stopCall = () => {
    callId = null;

    if (timerRequestData) {
      clearTimeout(timerRequestData);
      timerRequestData = null;
    }
    if (timerAutoEndCall) {
      clearTimeout(timerAutoEndCall);
      timerAutoEndCall = null;
    }
    if (timerSendChunkToServer) {
      clearTimeout(timerSendChunkToServer);
      timerSendChunkToServer = null;
    }

    if (recorder) {
      if ('inactive' !== recorder.state) {
        recorder.stop();
      }
      console.log('recorder was cleared!');
    }

    ipcRenderer.send('close-call-window');
    // BrowserWindow.getAllWindows().forEach((win) => {
    //   if (win.id > 1) {
    //     win.close()
    //   }
    // })
  };

  ipcRenderer.on('stop-call', () => {
    stopCall();
  });

  return {
    initStream: initStream,
    startCall: startCall,
    stopCall: stopCall,
  };
};

export default record;
