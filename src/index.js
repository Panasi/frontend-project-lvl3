import './styles.scss';
import * as yup from 'yup';
import i18n from 'i18next';
import watcher from './view.js';
import resources from './locales/ru.js';

const schema = yup.string().url();

const form = document.querySelector('.rss-form');
const input = document.querySelector('#url-input');

const state = {
  inputStatus: 'valid',
  feedbackMessage: '',
  previousUrls: [],
};
const i18nextInstance = i18n.createInstance();

i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources,
}).then(() => {
  const watchedState = watcher(state, i18nextInstance);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputValue = input.value;
    if (watchedState.previousUrls.includes(inputValue)) {
      watchedState.inputStatus = 'invalid';
      watchedState.feedbackMessage = 'exists';
      return;
    }
    schema.validate(inputValue)
      .then(() => {
        watchedState.inputStatus = 'valid';
        watchedState.feedbackMessage = 'success';
        watchedState.previousUrls.push(inputValue);
      })
      .catch(() => {
        watchedState.inputStatus = 'invalid';
        watchedState.feedbackMessage = 'invalidLink';
      });
  });
});
