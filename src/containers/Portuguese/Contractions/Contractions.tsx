import React, {FC, useMemo} from 'react';

import {PageTitle, QuizGame} from 'components';
import {useTranslation} from 'react-i18next';
import {buildContractionQuestions} from 'data/ptContractions';

const Contractions: FC = () => {
  const {t} = useTranslation();
  const questions = useMemo(buildContractionQuestions, []);

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('contractionsGameTitle')} />
      <QuizGame questions={questions} />
    </div>
  );
};

export default Contractions;
