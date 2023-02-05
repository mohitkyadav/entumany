import React, {FC} from 'react';

import {PageTitle} from 'components';

import HomeHero from './AnimatedHelloText/AnimatedHelloText';

const Home: FC = () => (
  <>
    <PageTitle title="Home" />
    <HomeHero />
  </>
);

export default Home;
