document.addEventListener('DOMContentLoaded', () => {
  const feedbackInput = document.getElementById('feedbackInput');
  const clearBtn = document.getElementById('clearFeedback');
  const submitBtn = document.getElementById('submitFeedback');
  const feedbackMsg = document.getElementById('feedbackMsg');
  const charCounter = document.getElementById('charCounter');

  const MIN_LENGTH = 40;

  // Early return if any required element is missing
  if (!feedbackInput || !clearBtn || !submitBtn || !charCounter || !feedbackMsg) {
    console.warn('⚠️ Feedback elements not found on page');
    return;
  }

  // Update UI on input
  feedbackInput.addEventListener('input', () => {
    const len = feedbackInput.value.trim().length;
    const charsLeft = MIN_LENGTH - len;

    submitBtn.disabled = len < MIN_LENGTH;

    if (len === 0) {
      charCounter.textContent = `✍️ Please enter your feedback.`;
      charCounter.style.color = 'gray';
    } else if (len < MIN_LENGTH) {
      charCounter.textContent = `✏️ ${charsLeft} more character${charsLeft !== 1 ? 's' : ''} required.`;
      charCounter.style.color = 'red';
    } else {
      charCounter.textContent = `✅ Ready to submit.`;
      charCounter.style.color = 'green';
    }
  });

  // Clear feedback
  clearBtn.addEventListener('click', () => {
    feedbackInput.value = '';
    submitBtn.disabled = true;
    feedbackMsg.textContent = '';
    feedbackMsg.style.display = 'none';
    charCounter.textContent = `Minimum ${MIN_LENGTH} characters required.`;
    charCounter.style.color = 'black';
  });

  // Submit feedback
  submitBtn.addEventListener('click', async () => {
    const message = feedbackInput.value.trim();
    if (message.length < MIN_LENGTH) return;

    // Disable button while submitting
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Sending...';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        feedbackMsg.textContent = '✅ Feedback submitted successfully!';
        feedbackMsg.style.color = 'green';
        feedbackInput.value = '';
        charCounter.textContent = `Minimum ${MIN_LENGTH} characters required.`;
      } else {
        throw new Error(result.error || 'Server error');
      }
    } catch (err) {
      feedbackMsg.textContent = `❌ Failed to send feedback. ${err.message}`;
      feedbackMsg.style.color = 'red';
    } finally {
      feedbackMsg.style.display = 'block';
      submitBtn.textContent = 'Submit';
      submitBtn.disabled = feedbackInput.value.trim().length < MIN_LENGTH;
    }
  });
});
