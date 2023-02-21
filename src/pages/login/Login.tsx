import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import jwt_decode from 'jwt-decode';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {
  setAuth,
  setEmails,
  setProxy,
  setInjectJs,
  setMyName,
  setUser,
} from './loginSlice';
import logo from '../../../assets/logo.svg';
import settingsIcon from '../../../assets/settings.svg';
import api from '../../config/api_config';
import { DISCORD_SERVER } from '../../shared/constants/urls';
// import fs from 'fs';
// import path from 'path';

// const address = localStorage.getItem('apiAddress') || DISCORD_SERVER;
const address = DISCORD_SERVER;

// const options = {
//   secure:true,
//   reconnect: true,
//   rejectUnauthorized : false,
//   ca: fs.readFileSync(`${path.resolve('resources/assets/ssl/rootCA.crt')}`),
//   cert: fs.readFileSync(`${path.resolve('resources/assets/ssl/client.crt')}`),
//   key: fs.readFileSync(`${path.resolve('resources/assets/ssl/client.key')}`),
// };
export const socket = io(`${address}`);

const Login = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [connected, setConnected] = useState(false);
  const [register, setRegister] = useState(false);

  useEffect(() => {
    // Synchronous message emmiter and handler

    socket.on('connect', function () {
      console.log(123, 'socket   ->   connected');
      setConnected(socket.connected);
    });
    socket.on('disconnect', function () {
      console.log(555, 'socket   ->   disconnected');
      setConnected(socket.connected);
    });
  }, [connected]);

  const [orgID, setOrg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const [password, setPassword] = useState(
    localStorage.getItem('userPassword') || ''
  );
  const [passwordr, setPasswordr] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const user = {
      email: email,
      password: password,
    };
    console.log(20230213, `user`, user);
    api
      .login(user)
      .then((res) => {
        const token = res.data.token;
        const jwtToken: any = jwt_decode(token);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userPassword', user.password);
        localStorage.setItem('apiAddress', address);
        setError('');
        dispatch(setAuth(jwtToken.account));
        dispatch(setMyName(user.email));
        dispatch(setEmails(jwtToken.email));
        dispatch(setProxy(jwtToken.proxy));
        dispatch(setUser(user));
        dispatch(setInjectJs(jwtToken.injectJs));
        ipcRenderer.send('set-window-title', user.email);
        history.push('/discord');
      })
      .catch((e) => {
        setError(e.response.data.message);
      });
  };

  const handleSubmitRegister = (event: any) => {
    event.preventDefault();
    if (
      password !== passwordr ||
      orgID === '' ||
      name === '' ||
      email === '' ||
      password === ''
    ) {
      Swal.fire('', 'Please fill in the form properly!', 'warning');
      return;
    }
    const user = {
      orgID: orgID,
      name: name,
      email: email,
      password: password,
    };

    api
      .register(user)
      .then(() => {
        Swal.fire('Successfully Registered!', '', 'success');
        setRegister(false);
      })
      .catch((e) => {
        setError(e.response.data.message);
      });
  };

  const toggleLoginRegister = () => {
    setRegister(!register);
  };

  const handleSettingsClick = () => {
    Swal.fire({
      title: 'Please input server address',
      input: 'text',
      inputPlaceholder: 'https://192.168.4.250:5000',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Set',
      showLoaderOnConfirm: true,
      preConfirm: (address) => {
        if (!address.includes('http')) {
          return false;
        }
        return fetch(`${address}`)
          .then(() => {
            localStorage.setItem('apiAddress', address);
            ipcRenderer.send('reload');
            setConnected(true);
          })
          .catch(() => {
            Swal.showValidationMessage(
              `Server is down or Address is not correct.`
            );
            setConnected(false);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Saved!', '', 'success');
      }
    });
  };

  return (
    <>
      {!register ? (
        <div className="Container">
          <img
            className="Settings"
            alt="settings"
            src={settingsIcon}
            onClick={handleSettingsClick}
          />
          <div className="Logo">
            <img width="100px" alt="icon" src={logo} />
          </div>
          <h1>Welcome to Discord</h1>
          <form className="LoginForm" onSubmit={handleSubmit}>
            {error && <label>{error}</label>}
            <input
              type="text"
              name="email"
              placeholder="Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="submit">
              {connected ? (
                <button type="submit">Login</button>
              ) : (
                <button disabled>Server is down.</button>
              )}
            </div>
          </form>
          <div className="link-text" onClick={toggleLoginRegister}>
            I don't have an account. Register?
          </div>
        </div>
      ) : (
        <div className="Container">
          <img
            className="Settings"
            alt="settings"
            src={settingsIcon}
            onClick={handleSettingsClick}
          />
          <div className="Logo">
            <img width="100px" alt="icon" src={logo} />
          </div>
          <h1>Welcome to Discord</h1>
          <form className="LoginForm" onSubmit={handleSubmitRegister}>
            {error && <label>{error}</label>}
            <input
              type="text"
              name="orgID"
              placeholder="Organization*"
              value={orgID}
              onChange={(e) => setOrg(e.target.value)}
            />
            <input
              type="text"
              name="name"
              placeholder="Full Name*"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              name="email"
              placeholder="Email Address*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              name="passwordr"
              placeholder="Password Confirm*"
              value={passwordr}
              onChange={(e) => setPasswordr(e.target.value)}
            />
            <div className="submit">
              {connected ? (
                <button type="submit">Register</button>
              ) : (
                <button disabled>Server is down.</button>
              )}
            </div>
          </form>
          <div className="link-text" onClick={toggleLoginRegister}>
            I already have an account. Login?
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
