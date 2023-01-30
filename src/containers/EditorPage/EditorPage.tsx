import React, {FC, useEffect} from 'react';

import {Button, LangEditor, PageTitle} from 'components';
import {EntumanyDB} from 'services/db.service';
import {Language, WordEntry} from 'types/db';

const EditorPage: FC = () => {
  const db = EntumanyDB.getInstance();

  useEffect(() => {
    db.populateFromLocalStorage();

    return () => db.saveToLocalStorage();
  }, [db]);

  // TODO: This is not working
  useEffect(() => {
    const pageCloseCloseHandler = (e: BeforeUnloadEvent) => {
      db.saveToLocalStorage();
      e.preventDefault();
      e.returnValue = 'message';
    };

    window.addEventListener('beforeunload', pageCloseCloseHandler);

    return window.removeEventListener('beforeunload', pageCloseCloseHandler);
  }, [db]);

  const [sourceState, setSourceState] = React.useState<WordEntry>({
    language: Language.ENGLISH,
    word: '',
  });
  const [destState, setDestState] = React.useState<WordEntry>({
    language: Language.HINDI,
    word: '',
  });

  const onSourceEditorChange = (word: string) => {
    setSourceState({
      ...sourceState,
      word,
    });
  };

  const onDestEditorChange = (word: string) => {
    setDestState({
      ...destState,
      word,
    });
  };

  const onSourceLangChange = (language: Language) => {
    setSourceState({
      ...sourceState,
      language,
    });
  };

  const onDestLangChange = (language: Language) => {
    setDestState({
      ...destState,
      language,
    });
  };

  const handleOnSaveClick = () => {
    db.addWords(sourceState, destState);
  };

  return (
    <div className="page">
      <PageTitle title="Editor" />
      <LangEditor
        key="sourceLangEditor"
        language={sourceState.language}
        onChange={onSourceEditorChange}
        onLanguageChange={onSourceLangChange}
      />
      <LangEditor
        key="destLangEditor"
        language={destState.language}
        onChange={onDestEditorChange}
        onLanguageChange={onDestLangChange}
      />

      <Button onClick={handleOnSaveClick}>Save</Button>
    </div>
  );
};

export default EditorPage;
