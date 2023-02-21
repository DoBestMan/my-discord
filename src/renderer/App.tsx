import React from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import Login from '../pages/login/Login';
import Home from '../pages/main/Home';
import './App.global.css';

import store from '../store';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <React.StrictMode>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/discord" component={Home} />
          </Switch>
        </React.StrictMode>
      </Router>
    </Provider>
  );
}
