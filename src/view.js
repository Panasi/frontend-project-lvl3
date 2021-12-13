import onChange from 'on-change';

const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');
const posts = document.querySelector('.posts');

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
    if (value === '') {
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = '';
    }
  }
  if (path === 'stage') {
    if (value === 'filled') {
      const card = document.createElement('div');
      card.classList.add('card', 'border-0');
      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');
      const cardTitle = document.createElement('h2');
      cardTitle.classList.add('card-title', 'h4');
      cardTitle.textContent = 'Посты';
      cardBody.append(cardTitle);
      card.append(cardBody);
      posts.append(card);
      const listGroup = document.createElement('ul');
      listGroup.classList.add('list-group', 'border-0', 'rounded-0');
      state.posts.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const link = document.createElement('a');
        link.classList.add('fw-bold');
        link.href = item.link;
        link.textContent = item.title;
        listItem.append(link);
        listGroup.append(listItem);
      });
      card.append(listGroup);
    }
  }
});
