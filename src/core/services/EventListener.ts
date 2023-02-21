import { ipcRenderer, shell } from 'electron';
import Swal from 'sweetalert2';
import LogService from './LogService';
import DownloadService from './DownloadService';
import MediaRecorder from './MediaRecorder';
import { Utils } from '../../utils/utils';
let recordFlag = false;

const listen = (webview, account) => {
  const mediaRecorder = MediaRecorder(account);
  webview?.addEventListener('new-window', (event) => {
    if (event.url.indexOf('discord.com/') < 0) {
      shell.openExternal(event.url);
    } else if (event.url.startsWith('https://files.discord.com')) {
      const domain = JSON.parse(localStorage.getItem('team')).domain;
      ipcRenderer.send('download-url', event.url, domain);
      event.preventDefault();
    } else if (event.url.startsWith('https://app.discord.com/free-willy/')) {
      // if the new window is a call
      // Swal.fire('Video Call is not Allowed!', '', 'warning');

      /// Video Call is not Allowed
      const callwindow = window.open(event.url);
      const injectScript = () => {
        const mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation?.target?.className === 'p-primary_call_window')
              alert('call ended');
            if (
              mutation?.removedNodes[0]?.className ===
              'p-active_speaker__member_image__spinner_wrapper'
            )
              alert('call started');
          });
        });
        mutationObserver.observe(document.documentElement, {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true,
          attributeOldValue: true,
          characterDataOldValue: true,
        });
      };
      const script = '(' + injectScript.toString() + '());';

      mediaRecorder.initStream();
      setTimeout(() => mediaRecorder.startCall(), 10000);
    } else {
      event.preventDefault();

      if (event.url.includes('discord.com/ssb/redirect')) {
        const url = event.url.replace('ssb/redirect', '');
        webview.loadURL(url);
      } else {
        console.log(20230213, 'bad request', event.url);
        webview.loadURL(event.url);
      }

      let isAttached = false;

      webview?.addEventListener('dom-ready', () => {
        if (isAttached) {
          return false;
        }
        isAttached = true;
        LogService(webview, account);
        DownloadService(account);
        return true;
      });
    }
  });

  webview?.addEventListener('did-redirect-navigation', (event) => {});

  const loadLogin = async (event, url) => {
    // console.log('start sleep');
    // await Utils.awaitSleep(5 * 1000);
    // console.log('finish sleep');
    // webview.loadURL(event.url);

    // if (event.url.startsWith('https://app.discord.com/')) {
    // } else
    if (event.url.includes('discord.com/ssb/redirect')) {
      webview.stop();
      const reUrl = event.url.replace('ssb/redirect', '');
      webview.loadURL(reUrl);
    }
  };

  webview?.addEventListener('will-navigate', (event, url) => {
    loadLogin(event, url);
  });
  webview?.addEventListener('dom-ready', () => {});
  webview?.addEventListener('did-stop-loading', () => {
    const currentURL = webview.getURL();
    if (currentURL.includes('https://discord.com/login')) {
      if (!recordFlag) {
        LogService(webview, account);
        recordFlag = true;
      }
    }
  });
};

export default listen;
