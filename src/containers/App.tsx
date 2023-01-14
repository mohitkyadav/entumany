import React, {FC} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';

import Home from './Home';
import Dashboard from './Dashboard';

const App: FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default App;
