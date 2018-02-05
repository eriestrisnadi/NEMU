import React from 'react';
import { render } from 'react-dom';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import './style.scss';
import App from './app/App';

// loads the Icon plugin
UIkit.use(Icons);

render(<App title="Saruaho" />, document.getElementById('root'));