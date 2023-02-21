const { contextBridge, ipcRenderer, ipcMain } = require('electron');
let workSpace, channel, email, password;

const removeAllSymbols = (string) => {
  const regex = /[0-9/A-Z/a-z/ /]/g;

  const letters = string.match(regex);
  if (letters) {
    const newText = letters.join('');
    return newText;
  } else {
    return '';
  }
};

ipcRenderer.on('getCredit', function (event, data) {
  console.log(20230213, `getCredit`, data);
  email = data.email;
  password = data.password;
});

ipcRenderer.on('getMyName', function (event, data) {
  console.log(20220627, '20220627');

  console.log(
    456798,
    document.getElementsByClassName('title-338goq')[0].textContent
  );

  console.log(
    456798,
    document.getElementsByClassName('wrapper-3kah-n')[0].textContent
  );

  if (
    document
      .getElementsByClassName('selected-1Drb7Z')[0]
      .getAttribute('aria-label') !== 'Direct Messages'
  ) {
    workSpace = document
      .getElementsByClassName('selected-1Drb7Z')[0]
      .getAttribute('aria-label');
    channel = document.getElementsByClassName('selected-2TbFuo')[0].textContent;
    console.log(
      123456,
      document.getElementsByClassName('selected-2TbFuo')[0].textContent
    );
  } else {
    workSpace = 'Home';
    channel = document.getElementsByClassName('selected-26oxtA')[0].textContent;
    console.log(
      321654,
      document.getElementsByClassName('selected-26oxtA')[0].textContent
    );
  }

  // channel = removeAllSymbols(channel);

  console.log(111111, workSpace);
  console.log(222222, channel);

  ipcRenderer.sendToHost('getMyNameHost', [
    document.getElementsByClassName('title-338goq')[0].textContent,
    workSpace,
    channel,
  ]);

  ipcRenderer.send(
    'getMyName',
    document.getElementsByClassName('title-338goq')[0].textContent
  );
  return document.getElementsByClassName('title-338goq')[0].textContent;
});

document.addEventListener('click', (event) => {
  const { target } = event;
  // if ('BUTTON' === target.nodeName && 'submit' === target.type) {
  //   const val = document.querySelector('input[type=email]').value;
  //   if (!email.filter((it) => it.email === val).length) {
  //     ipcRenderer.sendToHost('check-mail');
  //     event.preventDefault();
  //   }
  // }
  console.log(20230213, 'clickEvent', event);
  console.log(20230213, 'clickEvent', target);
  console.log(20230213, 'clickEvent', target.type);
  console.log(20230213, 'clickEvent', target.textContent);
  if (target.type === 'submit' && target.textContent === 'Log In') {
    console.log(20230213, target);
    // const emailContent = document.getElementsByClassName(
    //   'inputDefault-Ciwd-S input-3O04eu inputField-2RZxdl'
    // );
    const emailContent = document.getElementsByClassName(
      'inputDefault-Ciwd-S input-3O04eu'
    )[0];
    const passwordContent = document.getElementsByClassName(
      'inputDefault-Ciwd-S input-3O04eu'
    )[1];

    console.log(20230213, `emailContent`, emailContent.value);
    console.log(20230213, `passwordContent`, passwordContent.value);

    if (email !== emailContent.value || password !== passwordContent.value) {
      ipcRenderer.sendToHost('wrong-user');
      event.preventDefault();
    }

    // const val = document.querySelector('input[type=email]').value;
    // if (!email.filter((it) => it.email === val).length) {
    //   ipcRenderer.sendToHost('check-mail');
    //   event.preventDefault();
    // }
  }
});
