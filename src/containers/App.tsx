import React, {FC} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Home from './Home';
import Dashboard from './Dashboard';

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
