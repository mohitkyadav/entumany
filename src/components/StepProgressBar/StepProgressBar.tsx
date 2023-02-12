import clsx from 'clsx';
import React, {FC} from 'react';

import style from './StepProgressBar.module.scss';

export const StepProgressBar: FC<{current: number; total: number}> = ({current, total}) => {
  const totalSteps = Array(total).fill(0);

  return (
    <div className={style.StepProgressBar}>
      {totalSteps.map((_, idx) => (
        <div
          className={clsx(style.StepProgressBar__step, {
            [style['StepProgressBar__step--completed']]: idx < current,
          })}
          key={idx}
        />
      ))}
    </div>
  );
};
