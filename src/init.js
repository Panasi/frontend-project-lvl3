import 'bootstrap/js/dist/modal';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import watcher from './view.js';
import resources from './locales/ru.js';

const schema = yup.string().url();

const getProxy = (url) => {
  const proxy = new URL('https://hexlet-allorigins.herokuapp.com/get?');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};

const checkURL = (xml) => {
  if (xml.data.contents === null || xml.data.contents === '') {
    const error = new Error('Page not found');
    error.type = 'notExists';
    throw error;
  } else {
    return xml;
  }
};

const parseRSS = (xml) => {
  const xmlString = xml.data.contents;
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

const buildStackOfPosts = (watched, array) => {
  const stackOfPosts = array.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const id = watched.currentId;
    watched.currentId += 1;
    return {
      title,
      link,
      description,
      id,
    };
  });
  return stackOfPosts;
};

const addRSS = (dom, watched, url) => {
  const allPosts = dom.querySelectorAll('item');
  const arrayOfPosts = Array.from(allPosts);
  const stackOfPosts = buildStackOfPosts(watched, arrayOfPosts);
  watched.posts = [...stackOfPosts, ...watched.posts];
  const feedsTitle = dom.querySelector('title').textContent;
  const feedsDescription = dom.querySelector('description').textContent;
  const feed = { feedsTitle, feedsDescription };
  watched.feeds = [feed, ...watched.feeds];
  watched.uploadedFeeds.push(url);
  watched.feedbackMessage = 'success';
  watched.formStatus = 'sent';
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
    const stackOfPosts = buildStackOfPosts(watched, newPosts);
    watched.posts = [...stackOfPosts, ...watched.posts];
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
      setTimeout(() => updateRSS(watched, url), 5000);
    });
};

const loadRSS = (link, watched) => {
  watched.formStatus = 'sending';
  watched.inputStatus = 'valid';
  watched.feedbackMessage = 'empty';
  return schema.validate(link)
    .then(() => getProxy(link))
    .then((proxy) => axios.get(proxy))
    .then((response) => checkURL(response))
    .then((xmlData) => parseRSS(xmlData))
    .then((domData) => addRSS(domData, watched, link))
    .then(() => setTimeout(() => updateRSS(watched, link), 5000))
    .catch((error) => {
      if (error.type === 'url') {
        watched.inputStatus = 'invalid';
        watched.feedbackMessage = 'invalidLink';
        watched.formStatus = 'sent';
        return;
      }
      if (error.type === 'notExists') {
        watched.inputStatus = 'invalid';
        watched.feedbackMessage = 'notExists';
        watched.formStatus = 'sent';
        return;
      }
      if (error.type === 'notRSS') {
        watched.feedbackMessage = 'notRSS';
        watched.formStatus = 'sent';
        return;
      }
      if (error.type === undefined) {
        watched.feedbackMessage = 'networkError';
        watched.formStatus = 'sent';
        console.log(error);
      }
    });
};

const init = () => {
  const state = {
    formStatus: null,
    inputStatus: null,
    feedbackMessage: null,
    currentId: 1,
    uploadedFeeds: [],
    posts: [],
    feeds: [],
    viewedPostsIds: [],
    previewPostId: null,
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    sendButton: document.querySelector('.rss-form button'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalRead: document.querySelector('.modal-footer .full-article'),
    modalClose: document.querySelector('.modal-footer [data-bs-dismiss]'),
  };
  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const watchedState = watcher(state, elements, i18nextInstance);
    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputValue = elements.input.value;
      if (watchedState.uploadedFeeds.includes(inputValue)) {
        watchedState.inputStatus = 'invalid';
        watchedState.feedbackMessage = 'alreadyAdded';
        return;
      }
      loadRSS(inputValue, watchedState);
    });
    elements.posts.addEventListener('click', (event) => {
      if (event.target.className === 'btn btn-outline-primary btn-sm') {
        const eventId = Number(event.target.getAttribute('data-id'));
        watchedState.viewedPostsIds.push(eventId);
        watchedState.previewPostId = eventId;
      }
      if (event.target.tagName === 'A') {
        const eventId = Number(event.target.getAttribute('data-id'));
        watchedState.viewedPostsIds.push(eventId);
      }
    });
  });
};

export default init;
