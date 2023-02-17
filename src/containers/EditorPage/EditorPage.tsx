import React, {FC, useEffect} from 'react';

import {Button, LangEditor, PageTitle} from 'components';
import {useBeforeunload} from 'hooks';
import {EntumanyDB} from 'services/db.service';
import {Language, WordEntry} from 'types/db';

import {useNavigate} from 'react-router-dom';
import style from './EditorPage.module.scss';
import {ArrowLeft, InfoIcon, Save} from 'lucide-react';
import {ROUTES} from 'utils/constants';

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
    language: db.appOptions.primaryLanguage,
    word: '',
  });

  const [destState, setDestState] = React.useState<WordEntry>({
    language: db.appOptions.secondaryLanguage,
    word: '',
  });

  const resetInputs = () => {
    setSourceState((prevState) => {
      return {
        ...prevState,
        word: '',
      };
    });
    setDestState((prevState) => {
      return {
        ...prevState,
        word: '',
      };
    });
  };

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
    resetInputs();
    // TODO: show feedback, snackbar or something
  };

  return (
    <div className="page animation-slide-down">
      <PageTitle title="Editor" />

      <div className={style.EditorPage}>
        <div className={style.EditorPage__helper}>
          <InfoIcon size={24} />
          <p className="fs-20">Save your translations below</p>
        </div>
        <LangEditor
          key="sourceLangEditor"
          language={sourceState.language}
          onChange={onSourceEditorChange}
          onLanguageChange={onSourceLangChange}
          value={sourceState.word}
        />
        <LangEditor
          key="destLangEditor"
          language={destState.language}
          onChange={onDestEditorChange}
          onLanguageChange={onDestLangChange}
          value={destState.word}
        />
        <div className={style['EditorPage__buttons-container']}>
          <Button
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => {
              navigate(ROUTES.DASHBOARD);
            }}
            color="secondary"
            className="fs-16"
          >
            <p>Go Back</p>
          </Button>
          <Button className="fs-16" disabled={destState.language === sourceState.language} onClick={handleOnSaveClick}>
            <Save size={16} />
            <p>Save this translation</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
