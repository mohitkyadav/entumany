import clsx from 'clsx';
import React, {FC} from 'react';
import {EntumanyDB} from 'services/db.service';
import style from './Game.module.scss';

export interface GameProps {
  getRandomWords(words: Record<string, any>): Record<string, any>[];
}

const Game: FC<GameProps> = ({getRandomWords}) => {
  const dbInstance = EntumanyDB.getInstance();
  const allWords = dbInstance.database;

  console.log(getRandomWords(allWords));

  return <div className={clsx(style.Game, 'animation-scale-up')}>hi</div>;
};

export default Game;
