import onChange from 'on-change';

const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');

export default (state) => onChange(state, (path, value) => {
  if (path === 'inputStatus') {
    if (value === 'invalid') {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  }
  if (path === 'feedbackMessage') {
    if (value === 'RSS успешно загружен') {
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = value;
      input.value = '';
      input.focus();
    } else {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = value;
    }
  }
});
