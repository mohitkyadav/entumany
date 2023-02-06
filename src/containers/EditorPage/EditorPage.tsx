import React, {FC, useEffect} from 'react';

import {Button, LangEditor, PageTitle} from 'components';
import {useBeforeunload} from 'hooks';
import {EntumanyDB} from 'services/db.service';
import {Language, WordEntry} from 'types/db';

import {useNavigate} from 'react-router-dom';
import style from './EditorPage.module.scss';
import {ArrowLeft, Save} from 'lucide-react';

const EditorPage: FC = () => {
  const db = EntumanyDB.getInstance();
  const navigate = useNavigate();

  useBeforeunload((event) => {
    event.preventDefault();
    db.saveToLocalStorage();
  });

  useEffect(() => {
    return () => db.saveToLocalStorage();
  }, [db]);

  const [sourceState, setSourceState] = React.useState<WordEntry>({
    language: db.appOptions.language1 as Language,
    word: '',
  });
  const [destState, setDestState] = React.useState<WordEntry>({
    language: db.appOptions.language2 as Language,
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
    db.updateLanguage1(language);
    setSourceState({
      ...sourceState,
      language,
    });
  };

  const onDestLangChange = (language: Language) => {
    db.updateLanguage2(language);
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

      <div className={style.EditorPage}>
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
        <div className={style['EditorPage__buttons-container']}>
          <Button
            onClick={() => {
              navigate('/');
            }}
            color="secondary"
            className="fs-16"
          >
            <ArrowLeft size={16} /> Go Home
          </Button>
          <Button className="fs-16" disabled={destState.language === sourceState.language} onClick={handleOnSaveClick}>
            <Save size={16} /> Save this translation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
