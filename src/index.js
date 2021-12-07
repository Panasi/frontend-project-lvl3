import './styles.scss';
import * as yup from 'yup';
import watcher from './view.js';

const state = {
  inputStatus: 'valid',
  feedbackMessage: '',
  previousUrls: [],
};

const schema = yup.string().url();
const form = document.querySelector('.rss-form');
const input = document.querySelector('#url-input');
const watchedState = watcher(state);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputValue = input.value;
  if (watchedState.previousUrls.includes(inputValue)) {
    watchedState.inputStatus = 'invalid';
    watchedState.feedbackMessage = 'RSS уже существует';
    return;
  }
  schema.validate(inputValue)
    .then(() => {
      watchedState.inputStatus = 'valid';
      watchedState.feedbackMessage = 'RSS успешно загружен';
      watchedState.previousUrls.push(inputValue);
    })
    .catch(() => {
      watchedState.inputStatus = 'invalid';
      watchedState.feedbackMessage = 'Ссылка должна быть валидным URL';
    });
});
