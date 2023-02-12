import React, {FC} from 'react';

import style from './StepProgressBar.module.scss';

export const StepProgressBar: FC<{current: number; total: number}> = ({current, total}) => {
  return (
    <div className={style.StepProgressBar}>
      Progress: {current} / {total}
    </div>
  );
};
