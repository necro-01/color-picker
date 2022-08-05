const STORAGE_KEYS = 'eyedropper-colors';

const colorsEl = document.querySelector('.colors');
const messageEl = document.querySelector('.message');

async function pickNewColor() {
    let result = null;
    try {
        const ed = new EyeDropper();
        result = await ed.open();
    } catch (e) {
        // Silently fail, the user has canceled the pick.
        document.body.innerHTML = e;
        return;
    }

    if (result) {
        const color = result.sRGBHex;
        addColor(color);
        sendToClipboard(color);
        store(color);

        await showMessageAndHide(color);
    }
}

function addColor(color) {
    const el = document.createElement('li');
    el.classList.add('color');
    el.style.backgroundColor = color;
    el.title = `${color}- Click to copy`;
    
    const delEl = document.createElement('span');
    delEl.classList.add('del');
    delEl.title = `Remove`;
    el.appendChild(delEl);

    // colorsEl.appendChild(el);
    colorsEl.insertBefore(el, colorsEl.childNodes[0]);

    el.addEventListener('click', async (e) => {
        const isDel = e.target.classList.contains('del');
        if (isDel) {
            el.remove();
            removeFromStore(color);
        } else {
            await sendToClipboard(color);
            await showMessageAndHide(color);
        }
    });
}

async function showMessageAndHide(color) {
    showCopiedMessage(color);
    messageEl.style.backgroundColor = color;
}

async function sendToClipboard(color) {
    const result = await navigator.permissions.query({ name: "clipboard-write" });
    if (result.state == "granted" || result.state == "prompt") {
        try {
            await navigator.clipboard.writeText(color);
        } catch (e) {
        // Failed to write to the clipboard.
            document.body.innerHTML = e;
        }
    }
}

function showCopiedMessage(color) {
    messageEl.textContent = `${color} copied to the clipboard!`;
    messageEl.style.display = 'flex';
}

function getStored() {
    const stored = localStorage.getItem(STORAGE_KEYS);
    if (stored) {
        return JSON.parse(stored);
    } else {
        return [];
    }
}

function setStored(colors) {
    localStorage.setItem(STORAGE_KEYS, JSON.stringify(colors));
}

function store(color) {
    let colors = getStored();
    if (!Array.isArray(colors)) {
        colors = [];
    }

    if (!colors.includes(color)) {
        colors.push(color);
    }
    
    setStored(colors);
}

function removeFromStore(color) {
    let colors = getStored();
    if (!Array.isArray(colors)) {
        return;
    }

    const index = colors.findIndex(c => c === color);
    if (index > -1) {
        colors.splice(index, 1);
    }

    setStored(colors);
}

function clicked() {
    window.close();
}
    
document.querySelector('img').addEventListener('click', pickNewColor);

for (const color of getStored()) {
    addColor(color);
}