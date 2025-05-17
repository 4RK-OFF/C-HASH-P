const chmSelect = document.getElementById("chmSelect");
const metaOutput = document.getElementById("metaOutput");
const quorumOutput = document.getElementById("quorumOutput");
const messageMeta = document.getElementById("messageMeta");

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.text();
}

// Load file list from messages/ using a hardcoded index (adjust as needed)
const knownFiles = [
  "ChM-1.txt",
  "ChM-2.txt",
  "ChM-42.txt"
];

function populateDropdown() {
  for (const file of knownFiles) {
    const opt = document.createElement("option");
    opt.value = file;
    opt.textContent = file;
    chmSelect.appendChild(opt);
  }
}

async function loadAndDisplayMetadata(filename) {
  try {
    const content = await fetchText(`messages/${filename}`);
    const lines = content.split("\n");

    let metadata = {
      ID: "-",
      UTC: "-",
      "ChM-HASH": "-",
      "C-HASH": "-",
      "V-CHECK": "-"
    };

    for (const line of lines) {
      if (line.startsWith("ID:")) metadata.ID = line.slice(3).trim();
      else if (line.startsWith("UTC:")) metadata.UTC = line.slice(4).trim();
      else if (line.startsWith("ChM-HASH:")) metadata["ChM-HASH"] = line.slice(9).trim();
      else if (line.startsWith("C-HASH:")) metadata["C-HASH"] = line.slice(7).trim();
      else if (line.startsWith("V-CHECK:")) metadata["V-CHECK"] = line.slice(8).trim();
    }

    metaOutput.textContent = Object.entries(metadata)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");

    quorumOutput.textContent = "🔧 Coming soon: verify SIG1, SIG2, SIG3…";

    messageMeta.style.display = "block";

  } catch (err) {
    metaOutput.textContent = `❌ Failed to load: ${err.message}`;
    quorumOutput.textContent = "";
    messageMeta.style.display = "block";
  }
}

chmSelect.addEventListener("change", () => {
  const selected = chmSelect.value;
  if (selected) loadAndDisplayMetadata(selected);
});

populateDropdown();
