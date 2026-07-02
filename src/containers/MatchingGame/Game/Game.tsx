import clsx from 'clsx';
import {Button, VictoryModal} from 'components';
import {XCircleIcon} from 'lucide-react';
import React, {FC, useMemo, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {recordAnswer, recordGame} from 'services/progress.service';
import {WORD_GAME_IDS, getWordGameLanguages, pickGameWords, wordItemId} from 'services/wordGames.service';
import {Word, WordListItem} from 'types/db';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {ROUTES} from 'utils/constants';
import {generateRandomIntFromInterval} from 'utils/urls';

import style from './Game.module.scss';
import {generateUniqueArray} from 'utils/common';
import {Mistake} from 'components/VictoryModal/VictoryModal';

const buildRows = (words: Word[]): WordListItem[][] =>
  words.map((word) => {
    const [langA, langB] = getWordGameLanguages(word);
    return [
      {id: word.wordId, lang: langA, word: word[langA]},
      {id: word.wordId, lang: langB, word: word[langB]},
    ];
  });

const Game: FC = () => {
  const dbInstance = EntumanyDB.getInstance();
  const navigate = useNavigate();
  const [gameWords, setGameWords] = useState(() => pickGameWords(dbInstance.database));
  const [sequence, setSequence] = useState(() => generateUniqueArray(gameWords.length));
  const rows = useMemo(() => buildRows(gameWords), [gameWords]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [selectedFirstWord, setSelectedFirstWord] = useState<WordListItem>();
  const [selectedSecondWord, setSelectedSecondWord] = useState<WordListItem>();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const {t} = useTranslation();

  if (!gameWords.length) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const playFeedbackSound = (isSuccess: boolean) => {
    const audio = new Audio(isSuccess ? '/sounds/correct-1.mp3' : '/sounds/error-1.mp3');
    audio.play().catch((error) => {
      console.warn('Failed to play error sound:', error);
    });
  };

  const selectFirstWord = (selectedWord: WordListItem) => {
    setSelectedFirstWord(selectedWord);

    if (selectedSecondWord) checkMatch(selectedWord, selectedSecondWord);
  };

  const selectSecondWord = (selectedWord: WordListItem) => {
    setSelectedSecondWord(selectedWord);

    if (selectedFirstWord) checkMatch(selectedFirstWord, selectedWord);
  };

  const checkMatch = (firstWord: WordListItem, secondWord: WordListItem) => {
    const isMatch = firstWord?.id === secondWord?.id;

    if (isMatch) {
      playFeedbackSound(true);
      toast(t(`correctFeedback${generateRandomIntFromInterval(0, 2)}`), {
        icon: '✅',
        position: 'bottom-center',
      });
      recordAnswer(wordItemId(firstWord.id), true);
    } else {
      playFeedbackSound(false);
      toast(t(`inCorrectFeedback${generateRandomIntFromInterval(0, 2)}`), {
        icon: '🚫',
        position: 'bottom-center',
      });
      // A mismatch means both words were confused — count it against both.
      recordAnswer(wordItemId(firstWord.id), false);
      recordAnswer(wordItemId(secondWord.id), false);
      setMistakes((prev) => [
        ...prev,
        {
          firstWord,
          secondWord,
          timestamp: Date.now(),
        },
      ]);
    }

    const nextMatched = isMatch ? new Set(matchedIds).add(firstWord.id) : matchedIds;
    if (isMatch) setMatchedIds(nextMatched);

    setTimeout(() => {
      setSelectedFirstWord(undefined);
      setSelectedSecondWord(undefined);

      if (nextMatched.size === gameWords.length) {
        const accuracy = Math.round((100 * gameWords.length) / (gameWords.length + mistakes.length));
        recordGame(WORD_GAME_IDS.match, accuracy, 0);
        setShowVictoryModal(true);
      }
    }, 300);
  };

  const getButtonColour = (wordId: string, selectedId?: string) => {
    if (wordId === selectedId) {
      return 'secondary';
    }

    if (matchedIds.has(wordId)) {
      return 'tertiary';
    }

    return 'primary';
  };

  const handlePlayAgain = () => {
    const nextWords = pickGameWords(dbInstance.database);
    setGameWords(nextWords);
    setSequence(generateUniqueArray(nextWords.length));
    setMatchedIds(new Set());
    setSelectedFirstWord(undefined);
    setSelectedSecondWord(undefined);
    setMistakes([]);
    setShowVictoryModal(false);
  };

  return (
    <div className={clsx(style.Game, 'animation-slide-down')}>
      <Button
        color="secondary"
        className={style.Game__back}
        leftIcon={<XCircleIcon size={28} />}
        onClick={() => navigate('/')}
      />
      <div className={style.Game__container}>
        {sequence.map((colOne, colTwo) => {
          const firstWord = rows[colOne][0];
          const secondWord = rows[colTwo][1];

          return (
            <div key={firstWord.id + secondWord.id} className={style.Game__container__row}>
              <Button
                className="fs-16"
                color={getButtonColour(firstWord.id, selectedFirstWord?.id)}
                onClick={() => selectFirstWord(firstWord)}
                disabled={matchedIds.has(firstWord.id)}
              >
                {firstWord.word}
              </Button>
              <Button
                className="fs-16"
                color={getButtonColour(secondWord.id, selectedSecondWord?.id)}
                onClick={() => selectSecondWord(secondWord)}
                disabled={matchedIds.has(secondWord.id)}
              >
                {secondWord.word}
              </Button>
            </div>
          );
        })}
      </div>

      <VictoryModal
        isShown={showVictoryModal}
        totalPairs={sequence.length}
        mistakes={mistakes}
        onPlayAgain={handlePlayAgain}
        onHide={() => setShowVictoryModal(false)}
      />
    </div>
  );
};

export default Game;
