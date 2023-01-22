import React, {FC, useEffect, useState} from 'react';
import clsx from 'clsx';
import shuffle from 'lodash/shuffle';
import {useNavigate} from 'react-router-dom';

import {A, Button} from '../../../components';
import HelloWorld, {HelloWorldKeys, defaultHelloWorld} from './hello-world';
import Hero from './Hero.png';
import './HomeHero.scss';

const shuffledHelloKeys = shuffle(HelloWorldKeys);

enum HelloFadeClass {
  fadeIn = 'HomeHero__hello-world--fade-in',
  fadeOut = 'HomeHero__hello-world--fade-out',
}

const HomeHero: FC = () => {
  const [helloFadeClass, setHelloFadeClass] = useState<HelloFadeClass>(HelloFadeClass.fadeIn);
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
    <div className="HomeHero">
      <div className="HomeHero__wrapper">
        <div className="HomeHero__left">
          <div className="HomeHero__left-content-container">
            <span className={clsx('HomeHero__hello-world', 'fs-12', helloFadeClass)}>{helloText}</span>
            <h1 className="HomeHero__title">The entumany project</h1>
            <h2 className="HomeHero__subtitle">Need help?</h2>
            <A className="fs-12" href="https://www.deepl.com/en/translator">
              Try DeepL
            </A>
            <h2 className="HomeHero__subtitle">
              Learn words, archive here and create randomized quiz and test yourslef.
            </h2>
            <Button className="fs-14 ls-50" type="button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
        <div className="HomeHero__right">
          <img alt="hero" className="HomeHero__image" src={Hero} />
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
