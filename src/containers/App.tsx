import React, {FC} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Dashboard from './Dashboard/Dashboard';
import EditorPage from './EditorPage/EditorPage';

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
