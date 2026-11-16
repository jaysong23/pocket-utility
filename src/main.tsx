import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {applyInitialLanguage} from './language-preference.mjs';
import './styles.css';
applyInitialLanguage();
createRoot(document.getElementById('root')!).render(<App/>);
