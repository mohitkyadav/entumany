import clsx from 'clsx';
import React, {FC, useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {getActivityMatrix} from 'services/activity.service';
import style from './ActivityHeatmap.module.scss';

const WEEKS = 13;

const levelFor = (count: number, max: number): number => {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
};

export const ActivityHeatmap: FC = () => {
  const {t} = useTranslation();
  const columns = useMemo(() => getActivityMatrix(WEEKS), []);
  const max = useMemo(
    () => columns.reduce((m, col) => col.reduce((cm, day) => Math.max(cm, day.count), m), 0),
    [columns],
  );

  return (
    <div className={style.heatmap}>
      <div className={style.heatmap__grid}>
        {columns.map((col, ci) => (
          <div className={style.heatmap__col} key={ci}>
            {col.map((day) =>
              day.count < 0 ? (
                <span className={clsx(style.heatmap__cell, style['heatmap__cell--empty'])} key={day.date} />
              ) : (
                <span
                  className={clsx(style.heatmap__cell, style[`heatmap__cell--l${levelFor(day.count, max)}`])}
                  key={day.date}
                  title={`${day.count} · ${day.date}`}
                />
              ),
            )}
          </div>
        ))}
      </div>
      <div className={style.heatmap__legend}>
        <span>{t('lessLabel')}</span>
        <span className={clsx(style.heatmap__cell, style['heatmap__cell--l0'])} />
        <span className={clsx(style.heatmap__cell, style['heatmap__cell--l1'])} />
        <span className={clsx(style.heatmap__cell, style['heatmap__cell--l2'])} />
        <span className={clsx(style.heatmap__cell, style['heatmap__cell--l3'])} />
        <span className={clsx(style.heatmap__cell, style['heatmap__cell--l4'])} />
        <span>{t('moreLabel')}</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
