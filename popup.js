var saveBtn = document.getElementById('saveBtn');
var textInput = document.getElementById('textInput');
var clipsContainer = document.getElementById('clipsContainer');
var emptyMsg = document.getElementById('emptyMsg');

function loadClips() {
  chrome.storage.local.get('clips', function(result) {
    var clips = result.clips || [];
    renderClips(clips);
  });
}

function saveClip(text) {
  chrome.storage.local.get('clips', function(result) {
    var clips = result.clips || [];
    var newClip = {
      id: Date.now(),
      text: text,
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    clips.unshift(newClip);
    chrome.storage.local.set({ clips: clips }, function() {
      renderClips(clips);
    });
  });
}

function deleteClip(id) {
  chrome.storage.local.get('clips', function(result) {
    var clips = result.clips || [];
    var updated = clips.filter(function(c) {
      return c.id !== id;
    });
    chrome.storage.local.set({ clips: updated }, function() {
      renderClips(updated);
    });
  });
}

function renderClips(clips) {
  var existing = clipsContainer.querySelectorAll('.clip-card');
  existing.forEach(function(el) {
    el.remove();
  });

  if (clips.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  clips.forEach(function(clip) {
    var card = document.createElement('div');
    card.className = 'clip-card';
    card.dataset.id = clip.id;

    var textEl = document.createElement('p');
    textEl.className = 'clip-text';
    textEl.textContent = clip.text;

    var footer = document.createElement('div');
    footer.className = 'clip-footer';

    var timeEl = document.createElement('span');
    timeEl.className = 'clip-time';
    timeEl.textContent = clip.time;

    var actions = document.createElement('div');
    actions.className = 'clip-actions';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.textContent = 'copy';
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(clip.text).then(function() {
        copyBtn.textContent = 'copied';
        copyBtn.classList.add('copied');
        setTimeout(function() {
          copyBtn.textContent = 'copy';
          copyBtn.classList.remove('copied');
        }, 1500);
      });
    });

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'remove';
    deleteBtn.addEventListener('click', function() {
      card.style.opacity = '0';
      card.style.transform = 'translateY(-4px)';
      card.style.transition = 'opacity 0.15s, transform 0.15s';
      setTimeout(function() {
        deleteClip(clip.id);
      }, 150);
    });

    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);
    footer.appendChild(timeEl);
    footer.appendChild(actions);

    card.appendChild(textEl);
    card.appendChild(footer);

    clipsContainer.appendChild(card);
  });
}

saveBtn.addEventListener('click', function() {
  var text = textInput.value.trim();
  if (!text) return;
  saveClip(text);
  textInput.value = '';
  textInput.focus();
});

textInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    var text = textInput.value.trim();
    if (!text) return;
    saveClip(text);
    textInput.value = '';
  }
});

loadClips();