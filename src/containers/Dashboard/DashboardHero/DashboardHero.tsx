import React, {FC} from 'react';
import clsx from 'clsx';

import style from './DashboardHero.module.scss';
import AnimatedHelloText from './AnimatedHelloText/AnimatedHelloText';
import {A} from 'components';
import {Github} from 'lucide-react';

const DashboardHero: FC = () => (
  <div className={style['dashboard-hero']}>
    <div className={clsx(style['dashboard-hero__welcome-txt'], 'ls-50 fs-18')}>
      <AnimatedHelloText />
    </div>
    <A href="https://github.com/mohitkyadav/entumany">
      <Github size={28} />
    </A>
  </div>
);

export default DashboardHero;
