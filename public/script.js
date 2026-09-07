document.getElementById('analyseBtn').addEventListener('click', async () => {
  const input = document.getElementById('userInput').value.trim();
  const loading = document.getElementById('loading');
  const resultDiv = document.getElementById('result');
  const reportText = document.getElementById('reportText');
  const errorDiv = document.getElementById('error');

  // Reset
  resultDiv.style.display = 'none';
  errorDiv.style.display = 'none';

  if (!input) {
    errorDiv.textContent = 'Please enter a description first.';
    errorDiv.style.display = 'block';
    return;
  }

  loading.style.display = 'block';
  document.getElementById('analyseBtn').disabled = true;

  try {
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: input }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    reportText.textContent = data.result;
    resultDiv.style.display = 'block';
  } catch (err) {
    errorDiv.textContent = err.message || 'Failed to analyse.';
    errorDiv.style.display = 'block';
  } finally {
    loading.style.display = 'none';
    document.getElementById('analyseBtn').disabled = false;
  }
});