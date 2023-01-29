import React, {FC} from 'react';

import {LangEditor, PageTitle} from 'components';

const EditorPage: FC = () => (
  <div className="page">
    <PageTitle title="Editor" />
    <LangEditor key="sourceLangEditor" language="hi-IN" />
    <LangEditor key="destLangEditor" language="de-DE" />
  </div>
);

export default EditorPage;
