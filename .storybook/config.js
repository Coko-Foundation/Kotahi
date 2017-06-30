import { configure } from '@storybook/react';

import 'pubsweet-fira'
import 'typeface-fira-sans-condensed'
import 'typeface-vollkorn'

import '../app/styles/main.scss'

function loadStories() {
  require('../stories');
}

configure(loadStories, module);
