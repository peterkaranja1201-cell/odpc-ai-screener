document.getElementById('analyseBtn').addEventListener('click', async () => {
  const input = document.getElementById('userInput').value.trim();
  const loading = document.getElementById('loading');
  const resultCard = document.getElementById('result');
  const reportSections = document.getElementById('reportSections');
  const errorDiv = document.getElementById('error');

  // Reset UI
  resultCard.style.display = 'none';
  reportSections.innerHTML = '';
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput: input }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    // Store raw report for copy button
    const rawReport = data.result;
    document.getElementById('reportText').textContent = rawReport;

    // Parse the report into sections
    const sections = parseReport(rawReport);
    renderSections(sections, reportSections);

    resultCard.style.display = 'block';
  } catch (err) {
    errorDiv.textContent = err.message || 'Failed to analyse.';
    errorDiv.style.display = 'block';
  } finally {
    loading.style.display = 'none';
    document.getElementById('analyseBtn').disabled = false;
  }
});

// Copy raw report to clipboard
document.getElementById('copyBtn').addEventListener('click', async () => {
  const rawText = document.getElementById('reportText').textContent;
  try {
    await navigator.clipboard.writeText(rawText);
    alert('Report copied to clipboard!');
  } catch (err) {
    alert('Failed to copy. Please select and copy manually.');
  }
});

function parseReport(text) {
  const sections = {};
  const lines = text.split('\n');
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('Score:')) {
      sections.score = trimmed.replace('Score:', '').trim();
      currentKey = null;
    } else if (trimmed.startsWith('Risk Level:')) {
      sections.riskLevel = trimmed.replace('Risk Level:', '').trim();
      currentKey = null;
    } else if (trimmed.startsWith('Key Issues:')) {
      currentKey = 'issues';
      sections.issues = [];
    } else if (trimmed.startsWith('Recommended Actions:')) {
      currentKey = 'actions';
      sections.actions = [];
    } else if (trimmed.startsWith('-')) {
      if (currentKey === 'issues') {
        sections.issues.push(trimmed.substring(1).trim());
      } else if (currentKey === 'actions') {
        sections.actions.push(trimmed.substring(1).trim());
      }
    } else {
      // If no explicit section header yet, ignore or treat as part of previous section
    }
  }

  return sections;
}

function renderSections(sections, container) {
  // Score badge
  if (sections.score) {
    const scoreBadge = document.createElement('div');
    scoreBadge.className = 'score-badge';
    scoreBadge.textContent = `Score: ${sections.score}/100`;
    container.appendChild(scoreBadge);
  }

  // Risk level
  if (sections.riskLevel) {
    const riskP = document.createElement('p');
    riskP.innerHTML = `Risk Level: <span class="risk-${sections.riskLevel.toLowerCase()}">${sections.riskLevel}</span>`;
    container.appendChild(riskP);
  }

  // Key Issues
  if (sections.issues && sections.issues.length > 0) {
    const issuesDiv = document.createElement('div');
    issuesDiv.className = 'section';
    const h3 = document.createElement('h3');
    h3.textContent = 'Key Issues';
    issuesDiv.appendChild(h3);
    const ul = document.createElement('ul');
    sections.issues.forEach(issue => {
      const li = document.createElement('li');
      li.textContent = issue;
      ul.appendChild(li);
    });
    issuesDiv.appendChild(ul);
    container.appendChild(issuesDiv);
  } else if (sections.issues) {
    const p = document.createElement('p');
    p.textContent = 'Key Issues: None';
    container.appendChild(p);
  }

  // Recommended Actions
  if (sections.actions && sections.actions.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'section';
    const h3 = document.createElement('h3');
    h3.textContent = 'Recommended Actions';
    actionsDiv.appendChild(h3);
    const ul = document.createElement('ul');
    sections.actions.forEach(action => {
      const li = document.createElement('li');
      li.textContent = action;
      ul.appendChild(li);
    });
    actionsDiv.appendChild(ul);
    container.appendChild(actionsDiv);
  } else if (sections.actions) {
    const p = document.createElement('p');
    p.textContent = 'Recommended Actions: None';
    container.appendChild(p);
  }

  // If no sections parsed (unexpected format), fallback to raw text
  if (!sections.score && !sections.riskLevel && !sections.issues && !sections.actions) {
    const pre = document.createElement('pre');
    pre.textContent = document.getElementById('reportText').textContent;
    container.appendChild(pre);
  }
}