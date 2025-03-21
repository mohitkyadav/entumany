import React, {FC} from 'react';

interface PageTitleProps {
  title: string;
}

export const PageTitle: FC<PageTitleProps> = ({title}) => {
  return <title>{title}</title>;
};
