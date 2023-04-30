import React, {FC} from 'react';
import {Toaster} from 'react-hot-toast';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ROUTES} from 'utils/constants';

import Dashboard from './Dashboard/Dashboard';
import EditorPage from './EditorPage/EditorPage';
import Playground from './Playground/Playground';
import WordList from './WordList/WordList';
import MatchingGame from './MatchingGame/MatchingGame';

const App: FC = () => {
  return (
    <Router>
      <div>
        <Toaster />
      </div>
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.EDITOR} element={<EditorPage />} />
        <Route path={ROUTES.MATCHING_GAME} element={<MatchingGame />} />
        <Route path={ROUTES.PLAYGROUND} element={<Playground />} />
        <Route path={ROUTES.WORD_LIST} element={<WordList />} />
      </Routes>
    </Router>
  );
};

export default App;
