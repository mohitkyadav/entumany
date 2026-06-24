import React, {FC} from 'react';
import {Toaster} from 'react-hot-toast';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ROUTES} from 'utils/constants';

import Dashboard from './Dashboard/Dashboard';
import EditorPage from './EditorPage/EditorPage';
import Playground from './Playground/Playground';
import WordList from './WordList/WordList';
import MatchingGame from './MatchingGame/MatchingGame';
import ArticleGame from './ArticleGame/ArticleGame';
import GermanHub from './German/GermanHub';
import PortugueseHub from './Portuguese/PortugueseHub';
import PackPage from './Portuguese/PackPage';
import PackGamePage from './Portuguese/PackGamePage';
import ConjugationTrainer from './Portuguese/ConjugationTrainer/ConjugationTrainer';
import VocabTrainer from './Portuguese/VocabTrainer/VocabTrainer';
import Settings from './Settings/Settings';

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
        <Route path={ROUTES.GERMAN_HUB} element={<GermanHub />} />
        <Route path={ROUTES.ARTICLE_GAME} element={<ArticleGame />} />
        <Route path={ROUTES.PORTUGUESE_CONJUGATION} element={<ConjugationTrainer />} />
        <Route path={ROUTES.PORTUGUESE_VOCAB} element={<VocabTrainer />} />
        <Route path={ROUTES.PORTUGUESE_HUB} element={<PortugueseHub />} />
        <Route path={ROUTES.PORTUGUESE_PACK} element={<PackPage />} />
        <Route path={ROUTES.PORTUGUESE_GAME} element={<PackGamePage />} />
        <Route path={ROUTES.PLAYGROUND} element={<Playground />} />
        <Route path={ROUTES.WORD_LIST} element={<WordList />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
