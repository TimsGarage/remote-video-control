document.getElementById('injectButton').addEventListener('click', () => {
    document.getElementById('injectButton').textContent = 'Injected';
    document.getElementById('injectButton').disabled = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['contentScript.js'], // Inject the script
        }, () => {
            console.log('Script injected successfully.');
        });
    });
});
