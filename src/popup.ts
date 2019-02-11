import './popup.css';

const elementById = document.getElementById("menu-item-options");
if (!elementById) {
    throw new DOMException("Unable to find menu-item-options");
}
elementById.onclick = () => chrome.runtime.openOptionsPage();
