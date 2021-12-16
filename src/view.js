import onChange from 'on-change';

const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');
const posts = document.querySelector('.posts');
const feeds = document.querySelector('.feeds');

const renderCardBody = (text) => {
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = text;
  cardBody.append(cardTitle);
  return cardBody;
};

export default (state, i18n) => onChange(state, (path, value) => {
  if (path === 'inputStatus') {
    if (value === 'invalid') {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  }
  if (path === 'feedbackMessage') {
    if (value === 'success') {
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('feedbackMessages.success');
      input.value = '';
      input.focus();
    }
    if (value === '') {
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = '';
    }
    if (value === 'alreadyAdded') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.alreadyAdded');
    }
    if (value === 'invalidLink') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.invalidLink');
    }
    if (value === 'notExists') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.notExists');
    }
    if (value === 'notRSS') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.notRSS');
    }
    if (value === 'networkError') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.networkError');
    }
  }
  if (path === 'stage') {
    if (value === 'filled') {
      posts.textContent = '';
      const postsCard = document.createElement('div');
      postsCard.classList.add('card', 'border-0');
      const postsCardBody = renderCardBody(i18n.t('posts'));
      postsCard.append(postsCardBody);
      const postsListGroup = document.createElement('ul');
      postsListGroup.classList.add('list-group', 'border-0', 'rounded-0');
      const statePosts = state.posts;
      statePosts.forEach((post) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const link = document.createElement('a');
        link.href = post.link;
        link.classList.add('fw-bold');
        link.setAttribute('data-id', `${post.id}`);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = post.title;
        listItem.append(link);
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.type = 'button';
        button.setAttribute('data-id', `${post.id}`);
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#modal');
        button.textContent = i18n.t('viewing');
        listItem.append(button);
        postsListGroup.append(listItem);
      });
      postsCard.append(postsListGroup);
      posts.append(postsCard);
      feeds.textContent = '';
      const feedsCard = document.createElement('div');
      feedsCard.classList.add('card', 'border-0');
      const feedsCardBody = renderCardBody(i18n.t('feeds'));
      feedsCard.append(feedsCardBody);
      const feedsListGroup = document.createElement('ul');
      feedsListGroup.classList.add('list-group', 'border-0', 'rounded-0');
      const stateFeeds = state.feeds;
      stateFeeds.forEach((feed) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
        const feedsTitle = document.createElement('h3');
        feedsTitle.classList.add('h6', 'm-0');
        feedsTitle.textContent = feed.feedsTitle;
        listItem.append(feedsTitle);
        const feedsDescription = document.createElement('P');
        feedsDescription.classList.add('m-0', 'small', 'text-black-50');
        feedsDescription.textContent = feed.feedsDescription;
        listItem.append(feedsDescription);
        feedsListGroup.append(listItem);
      });
      feedsCard.append(feedsListGroup);
      feeds.append(feedsCard);
    }
  }
});
