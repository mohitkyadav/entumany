import React, {FC} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Home from './Home/Home';
import Dashboard from './Dashboard/Dashboard';
import EditorPage from './EditorPage/EditorPage';

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
