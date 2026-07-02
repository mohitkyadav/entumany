import clsx from 'clsx';
import React, {FC} from 'react';
import {Link} from 'react-router-dom';

import {BackButton} from '../BackButton/BackButton';
import style from './GameHub.module.scss';

export interface GameHubItem {
  title: string;
  description: string;
  flag?: string;
  route: string;
  /** Optional progress line, e.g. "12/110 mastered". */
  badge?: string;
}

export interface GameHubProps {
  title: string;
  items: GameHubItem[];
  /** Where the back button navigates to (defaults to the dashboard). */
  backTo?: string;
}

export const GameHub: FC<GameHubProps> = ({title, items, backTo = '/'}) => {
  return (
    <div className={clsx(style.GameHub, 'animation-slide-down')}>
      <div className={style.GameHub__header}>
        <BackButton to={backTo} />
        <h1 className={style.GameHub__title}>{title}</h1>
      </div>

      <div className={style.GameHub__grid}>
        {items.map((item) => (
          <Link to={item.route} key={item.route} className={clsx('unset-a', style.GameHub__card)}>
            <span className={style.GameHub__card__icon}>{item.flag ?? '🎲'}</span>
            <span className={style.GameHub__card__body}>
              <span className={style.GameHub__card__title}>{item.title}</span>
              <span className={style.GameHub__card__desc}>{item.description}</span>
              {item.badge && <span className={style.GameHub__card__badge}>{item.badge}</span>}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameHub;
