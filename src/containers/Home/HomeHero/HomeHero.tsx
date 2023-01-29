import React, {FC, useEffect, useState} from 'react';
import clsx from 'clsx';
import shuffle from 'lodash/shuffle';
import {useNavigate} from 'react-router-dom';

import {Button} from '../../../components';
import HelloWorld, {HelloWorldKeys, defaultHelloWorld} from './hello-world';
import Hero from './Hero.png';
import style from './HomeHero.module.scss';

const shuffledHelloKeys = shuffle(HelloWorldKeys);

const HelloFadeClass: Record<string, string> = {
  fadeIn: style['HomeHero__hello-world--fade-in'],
  fadeOut: style['HomeHero__hello-world--fade-out'],
};

const HomeHero: FC = () => {
  const [helloFadeClass, setHelloFadeClass] = useState<string>(HelloFadeClass.fadeIn);
  const [helloText, setHelloText] = useState<string>(defaultHelloWorld);
  const navigate = useNavigate();

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setHelloFadeClass(HelloFadeClass.fadeOut);

      setTimeout(() => {
        const key = shuffledHelloKeys[i];
        setHelloText(HelloWorld[key]);
        i += 1;
        if (i === shuffledHelloKeys.length) {
          i = 0;
        }
        setHelloFadeClass(HelloFadeClass.fadeIn);
      }, 1000);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [setHelloFadeClass]);

  return (
    <div className={style.HomeHero}>
      <div className={style.HomeHero__wrapper}>
        <div className={style.HomeHero__left}>
          <div className={style['HomeHero__left-content-container']}>
            <span className={clsx(style['HomeHero__hello-world'], 'fs-18', helloFadeClass)}>{helloText}</span>
            <h1 className={style.HomeHero__title}>The entumany project</h1>
            <h2 className={style.HomeHero__subtitle}>
              Add new words you learn here, revisit and create randomized quiz to test yourself.
            </h2>
            <Button className="fs-18 ls-50" type="button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
        <div className={style.HomeHero__right}>
          <img alt="hero" className={style.HomeHero__image} src={Hero} />
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
