const messagesPath = 'messages/';
const signer = 'SIG3';
const sigPath = `signers/${signer}/`;

async function loadMessage(filename) {
  const messageText = await fetch(`${messagesPath}${filename}`).then(res => res.text());

  // Extract fields
  const lines = messageText.split('\n');
  const info = {
    id: extractField(lines, 'ID'),
    utc: extractField(lines, 'UTC'),
    chmHash: extractField(lines, 'ChM-HASH'),
    cHash: extractField(lines, 'C-HASH'),
    vCheck: extractField(lines, 'V-CHECK'),
    fullText: messageText
  };

  // Compute SHA256 of full file content
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(messageText));
  const computedHash = [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  info.computedHash = computedHash;

  // Fetch SIG3 signature (if it exists)
  try {
    const sig = await fetch(`${sigPath}${signer}-${filename}.sig`).then(res => res.text());
    info.sig3 = sig.trim();
    info.sig3Valid = sig.trim() === computedHash;
  } catch {
    info.sig3 = null;
    info.sig3Valid = false;
  }

  return info;
}

function extractField(lines, key) {
  const line = lines.find(l => l.startsWith(`${key}:`));
  return line ? line.split(':').slice(1).join(':').trim() : null;
}

async function updateUI(filename) {
  const info = await loadMessage(filename);

  const infoBox = document.getElementById('message-info');
  infoBox.innerHTML = `
    <pre>
ID: ${info.id}
UTC: ${info.utc}
ChM-HASH: ${info.chmHash}
C-HASH: ${info.cHash}
V-CHECK: ${info.vCheck}
FILE-HASH: ${info.computedHash}
    </pre>
  `;

  const quorumBox = document.getElementById('quorum-info');
  quorumBox.innerHTML = info.sig3
    ? `✅ SIG3 signature: <code>${info.sig3}</code><br>✔️ Valid match: ${info.sig3Valid ? 'Yes ✅' : 'No ❌'}`
    : `❌ SIG3 signature missing.`;
}

async function listMessages() {
  const files = ["ChM-1.txt", "ChM-2.txt", "ChM-42.txt"]; // Hardcoded since GitHub Pages blocks directory listing

  const select = document.getElementById('message-select');
  files.forEach(file => {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = file;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    if (select.value) updateUI(select.value);
  });
}

listMessages();
