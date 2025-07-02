document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/hit')
    .then(res => res.json())
    .then(data => {
      const hitElement = document.getElementById('hitCount');
      if (hitElement) hitElement.textContent = data.count;
    })
    .catch(err => {
      console.warn('Could not fetch hit count', err);
      const hitElement = document.getElementById('hitCount');
      if (hitElement) hitElement.textContent = 'N/A';
    });
});
