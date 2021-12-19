import onChange from 'on-change';

const renderFeedbackMessage = (elements, remove, add, message) => {
  elements.feedback.classList.remove(remove);
  elements.feedback.classList.add(add);
  elements.feedback.textContent = message;
};

const buildCardBody = (text) => {
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = text;
  cardBody.append(cardTitle);
  return cardBody;
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  if (path === 'formStatus') {
    if (value === 'sending') {
      elements.input.setAttribute('readonly', 'readonly');
      elements.sendButton.disabled = true;
    } else {
      elements.input.removeAttribute('readonly', 'readonly');
      elements.sendButton.disabled = false;
    }
  }
  if (path === 'inputStatus') {
    if (value === 'invalid') {
      elements.input.classList.add('is-invalid');
    } else {
      elements.input.classList.remove('is-invalid');
    }
  }
  if (path === 'feedbackMessage') {
    if (value === 'success') {
      renderFeedbackMessage(elements, 'text-danger', 'text-success', i18n.t('feedbackMessages.success'));
      return;
    }
    if (value === 'empty') {
      renderFeedbackMessage(elements, 'text-danger', 'text-success', i18n.t('feedbackMessages.empty'));
      return;
    }
    if (value === 'alreadyAdded') {
      renderFeedbackMessage(elements, 'text-success', 'text-danger', i18n.t('feedbackMessages.alreadyAdded'));
      return;
    }
    if (value === 'invalidLink') {
      renderFeedbackMessage(elements, 'text-success', 'text-danger', i18n.t('feedbackMessages.invalidLink'));
      return;
    }
    if (value === 'notExists') {
      renderFeedbackMessage(elements, 'text-success', 'text-danger', i18n.t('feedbackMessages.notExists'));
      return;
    }
    if (value === 'notRSS') {
      renderFeedbackMessage(elements, 'text-success', 'text-danger', i18n.t('feedbackMessages.notRSS'));
      return;
    }
    if (value === 'networkError') {
      renderFeedbackMessage(elements, 'text-success', 'text-danger', i18n.t('feedbackMessages.networkError'));
    }
  }
  if (path === 'posts' || path === 'viewedPostsIds') {
    elements.posts.textContent = '';
    const postsCard = document.createElement('div');
    postsCard.classList.add('card', 'border-0');
    const postsCardBody = buildCardBody(i18n.t('posts'));
    postsCard.append(postsCardBody);
    const postsListGroup = document.createElement('ul');
    postsListGroup.classList.add('list-group', 'border-0', 'rounded-0');
    const statePosts = state.posts;
    statePosts.forEach((post) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const link = document.createElement('a');
      link.href = post.link;
      if (state.viewedPostsIds.includes(post.id)) {
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
      } else {
        link.classList.add('fw-bold');
      }
      link.setAttribute('data-id', `${post.id}`);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.textContent = post.title;
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.type = 'button';
      button.setAttribute('data-id', `${post.id}`);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18n.t('viewing');
      listItem.append(link, button);
      postsListGroup.append(listItem);
    });
    postsCard.append(postsListGroup);
    elements.posts.append(postsCard);
  }
  if (path === 'feeds') {
    elements.feeds.textContent = '';
    const feedsCard = document.createElement('div');
    feedsCard.classList.add('card', 'border-0');
    const feedsCardBody = buildCardBody(i18n.t('feeds'));
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
      const feedsDescription = document.createElement('P');
      feedsDescription.classList.add('m-0', 'small', 'text-black-50');
      feedsDescription.textContent = feed.feedsDescription;
      listItem.append(feedsTitle, feedsDescription);
      feedsListGroup.append(listItem);
    });
    feedsCard.append(feedsListGroup);
    elements.feeds.append(feedsCard);
    elements.form.reset();
    elements.input.focus();
  }
  if (path === 'previewPostId') {
    const [linkedPost] = state.posts.filter((post) => post.id === value);
    elements.modalBody.textContent = linkedPost.description;
    elements.modalTitle.textContent = linkedPost.title;
    elements.modalClose.textContent = i18n.t('modal.close');
    elements.modalRead.textContent = i18n.t('modal.read');
    elements.modalRead.href = linkedPost.link;
  }
});
