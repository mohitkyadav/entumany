import clsx from 'clsx';
import React, {FC} from 'react';

import {A} from 'components';
import {LanguageSwitcher} from 'components/LanguageSwitcher/LanguageSwitcher';
import {Github} from 'lucide-react';
import AnimatedHelloText from './AnimatedHelloText/AnimatedHelloText';
import style from './DashboardHero.module.scss';

const DashboardHero: FC = () => (
  <div className={style['dashboard-hero']}>
    <div className={clsx(style['dashboard-hero__welcome-txt'], 'ls-50 fs-18')}>
      <AnimatedHelloText />
    </div>
    <div className={style['right-nav-actions']}>
      <LanguageSwitcher />
      <A href="https://github.com/mohitkyadav/entumany">
        <Github size={30} />
      </A>
    </div>
  </div>
);

export default DashboardHero;
