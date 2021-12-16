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
  uploadedFeeds: [],
  posts: [],
  feeds: [],
};
const i18nextInstance = i18n.createInstance();
let postIdCounter = 1;

const checkDouble = (url, watched) => {
  if (watched.uploadedFeeds.includes(url)) {
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
    const error = new Error('Resource does not contain valid RSS');
    error.type = 'notRSS';
    throw error;
  } else {
    return documnetData;
  }
};

const buildStackOfPosts = (posts) => {
  const stackOfPosts = posts.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const id = postIdCounter;
    postIdCounter += 1;
    return {
      title,
      link,
      description,
      id,
    };
  });
  return stackOfPosts;
};

const addFeeds = (dom, watched, url) => {
  watched.stage = 'filling';
  const posts = dom.querySelectorAll('item');
  const arrayOfPosts = Array.from(posts);
  const stackOfPosts = buildStackOfPosts(arrayOfPosts);
  watched.posts = [...stackOfPosts, ...watched.posts];
  const feedsTitle = dom.querySelector('title').textContent;
  const feedsDescription = dom.querySelector('description').textContent;
  const feed = { feedsTitle, feedsDescription };
  watched.feeds = [feed, ...watched.feeds];
  watched.uploadedFeeds.push(url);
  watched.stage = 'filled';
  watched.feedbackMessage = 'success';
};

const updatePosts = (dom, watched) => {
  const allPosts = dom.querySelectorAll('item');
  const arrayOfAllPosts = Array.from(allPosts);
  const uploadedPostsTitles = watched.posts.map((post) => post.title);
  const newPosts = arrayOfAllPosts.filter((item) => {
    const postTitle = item.querySelector('title').textContent;
    return !uploadedPostsTitles.includes(postTitle);
  });
  if (newPosts.length > 0) {
    watched.stage = 'filling';
    const stackOfPosts = buildStackOfPosts(newPosts);
    watched.posts = [...stackOfPosts, ...watched.posts];
    watched.stage = 'filled';
  }
};

const updateRSS = (watched, url) => {
  const proxy = getProxy(url);
  axios.get(proxy)
    .then((response) => parseRSS(response))
    .then((htmlData) => updatePosts(htmlData, watched))
    .then(() => setTimeout(() => updateRSS(watched, url), 5000))
    .catch((error) => {
      console.log(error);
    });
};

const loadRSS = (link, watched) => schema.validate(link)
  .then(() => checkDouble(link, watched))
  .then(() => getProxy(link))
  .then((proxy) => axios.get(proxy))
  .then((response) => checkURL(response))
  .then((rssData) => parseRSS(rssData))
  .then((htmlData) => addFeeds(htmlData, watched, link))
  .then(() => setTimeout(() => updateRSS(watched, link), 5000))
  .catch((error) => {
    if (error.type === 'url') {
      watched.inputStatus = 'invalid';
      watched.feedbackMessage = 'invalidLink';
      return;
    }
    if (error.type === 'alreadyAdded') {
      watched.inputStatus = 'invalid';
      watched.feedbackMessage = 'alreadyAdded';
      return;
    }
    if (error.type === 'notExists') {
      watched.inputStatus = 'invalid';
      watched.feedbackMessage = 'notExists';
      return;
    }
    if (error.type === 'notRSS') {
      watched.feedbackMessage = 'notRSS';
      return;
    }
    if (error.type === undefined) {
      watched.feedbackMessage = 'networkError';
    }
  });

i18nextInstance.init({
  lng: 'ru',
  debug: false,
  resources,
}).then(() => {
  const watchedState = watcher(state, i18nextInstance);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.inputStatus = 'valid';
    watchedState.feedbackMessage = '';
    const inputValue = input.value;
    loadRSS(inputValue, watchedState);
  });
});
