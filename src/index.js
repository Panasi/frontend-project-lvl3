import './styles.scss';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import watcher from './view.js';
import resources from './locales/ru.js';

const schema = yup.string().url();

const form = document.querySelector('.rss-form');
const input = document.querySelector('#url-input');

const state = {
  inputStatus: null,
  feedbackMessage: null,
  stage: null,
  previousUrls: [],
  posts: [],
  feeds: [],
};
const i18nextInstance = i18n.createInstance();

const checkDouble = (url, watched) => {
  if (watched.previousUrls.includes(url)) {
    const error = new Error('RSS already exists');
    error.type = 'alreadyAdded';
    throw error;
  }
};

const getProxy = (url) => {
  const proxyURL = new URL('https://hexlet-allorigins.herokuapp.com/get?');
  proxyURL.searchParams.set('disableCache', 'true');
  proxyURL.searchParams.set('url', url);
  return proxyURL.toString();
};

const checkURL = (urlData) => {
  if (urlData.data.contents === null || urlData.data.contents === '') {
    const error = new Error('Page not found');
    error.type = 'notExists';
    throw error;
  } else {
    return urlData;
  }
};

const parseRSS = (rss) => {
  const xmlString = rss.data.contents;
  const parser = new DOMParser();
  const documnetData = parser.parseFromString(xmlString, 'application/xml');
  const errorNode = documnetData.querySelector('parsererror');
  if (errorNode !== null) {
    const error = new Error('The link must be a valid URL');
    error.type = 'notRSS';
    throw error;
  } else {
    return documnetData;
  }
};

const addPosts = (dom, watched, url) => {
  const posts = dom.querySelectorAll('item');
  const array = Array.from(posts);
  array.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    watched.posts.push({ title, link, description });
  });
  watched.previousUrls.push(url);
  watched.stage = 'filled';
  watched.feedbackMessage = 'success';
};

const addRSS = (link, watched) => schema.validate(link)
  .then(() => checkDouble(link, watched))
  .then(() => getProxy(link))
  .then((proxy) => axios.get(proxy))
  .then((response) => checkURL(response))
  .then((rssData) => parseRSS(rssData))
  .then((htmlData) => addPosts(htmlData, watched, link));

i18nextInstance.init({
  lng: 'ru',
  debug: false,
  resources,
}).then(() => {
  const watchedState = watcher(state, i18nextInstance);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.stage = 'filling';
    watchedState.inputStatus = 'valid';
    watchedState.feedbackMessage = '';
    const inputValue = input.value;
    addRSS(inputValue, watchedState)
      .catch((error) => {
        if (error.type === 'url') {
          watchedState.inputStatus = 'invalid';
          watchedState.feedbackMessage = 'invalidLink';
        }
        if (error.type === 'alreadyAdded') {
          watchedState.inputStatus = 'invalid';
          watchedState.feedbackMessage = 'alreadyAdded';
        }
        if (error.type === 'notExists') {
          watchedState.inputStatus = 'invalid';
          watchedState.feedbackMessage = 'notExists';
        }
        if (error.type === 'notRSS') {
          watchedState.feedbackMessage = 'notRSS';
        }
        if (error.type === undefined) {
          watchedState.feedbackMessage = 'networkError';
        }
      });
  });
});
