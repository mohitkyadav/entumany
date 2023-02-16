import React, {FC} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ROUTES} from 'utils/constants';

import Dashboard from './Dashboard/Dashboard';
import EditorPage from './EditorPage/EditorPage';
import Playground from './Playground/Playground';

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.EDITOR} element={<EditorPage />} />
        <Route path={ROUTES.PLAYGROUND} element={<Playground />} />
      </Routes>
    </Router>
  );
};

export default App;
