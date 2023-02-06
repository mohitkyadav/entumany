import clsx from 'clsx';
import shuffle from 'lodash/shuffle';
import React, {FC, useEffect, useState} from 'react';

import HelloWorld, {defaultHelloWorld, HelloWorldKeys} from './hello-world';
import style from './AnimatedHelloText.module.scss';

const shuffledHelloKeys = shuffle(HelloWorldKeys);

const HelloFadeClass: Record<string, string> = {
  fadeIn: style['HelloText__hello-world--fade-in'],
  fadeOut: style['HelloText__hello-world--fade-out'],
};

const AnimatedHelloText: FC = () => {
  const [helloFadeClass, setHelloFadeClass] = useState<string>(HelloFadeClass.fadeIn);
  const [helloText, setHelloText] = useState<string>(defaultHelloWorld);

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
    <div>
      <span className={clsx(style['HelloText__hello-world'], 'fs-14', helloFadeClass)}>{helloText}</span>
    </div>
  );
};

export default AnimatedHelloText;
