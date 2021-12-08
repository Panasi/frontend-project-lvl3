import onChange from 'on-change';

const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');

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
    if (value === 'exists') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.exists');
    }
    if (value === 'invalidLink') {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t('feedbackMessages.invalidLink');
    }
  }
});
