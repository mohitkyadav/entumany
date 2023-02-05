import React, {FC} from 'react';
import clsx from 'clsx';

import style from './DashboardHero.module.scss';
import AnimatedHelloText from 'containers/Home/AnimatedHelloText/AnimatedHelloText';

const DashboardHero: FC = () => (
  <div className={style['dashboard-hero']}>
    <div className={clsx(style['dashboard-hero__welcome-txt'], 'ls-50 fs-18')}>
      <AnimatedHelloText />
    </div>
    <div className={style['dashboard-hero__user']}>
      <img
        className={style['dashboard-hero__user__image']}
        alt="user avatar"
        src="https://github.com/mohitkyadav.png"
      />
    </div>
  </div>
);

export default DashboardHero;
