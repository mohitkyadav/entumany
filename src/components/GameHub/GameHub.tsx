import clsx from 'clsx';
import {XCircleIcon} from 'lucide-react';
import React, {FC} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {Button} from '../FormElements';
import style from './GameHub.module.scss';

export interface GameHubItem {
  title: string;
  description: string;
  flag?: string;
  route: string;
  /** Optional progress badge, e.g. "12/110 mastered". */
  badge?: string;
}

export interface GameHubProps {
  title: string;
  items: GameHubItem[];
  /** Where the back button navigates to (defaults to the dashboard). */
  backTo?: string;
}

export const GameHub: FC<GameHubProps> = ({title, items, backTo = '/'}) => {
  const navigate = useNavigate();

  return (
    <div className={clsx(style.GameHub, 'animation-slide-down')}>
      <Button
        color="secondary"
        className={style.GameHub__back}
        leftIcon={<XCircleIcon size={28} />}
        onClick={() => navigate(backTo)}
      />

      <h1 className={style.GameHub__title}>{title}</h1>

      <div className={style.GameHub__grid}>
        {items.map((item) => (
          <Link to={item.route} key={item.route} className={clsx('unset-a', style.GameHub__card)}>
            {item.flag && <span className={style.GameHub__card__flag}>{item.flag}</span>}
            <span className={style.GameHub__card__title}>{item.title}</span>
            <span className={style.GameHub__card__desc}>{item.description}</span>
            {item.badge && <span className={style.GameHub__card__badge}>{item.badge}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameHub;
