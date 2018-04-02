// import backgroundStore from '../stores';
// import {decrementBackgroundCounter, incrementBackgroundCounter} from '../actions';
// import RunAt = browser.extensionTypes.RunAt;
//
// // increment or decrement background counter every second
// setTimeout(() => {
//   backgroundStore.dispatch(Math.random() >= 0.5 ?
//       incrementBackgroundCounter() :
//       decrementBackgroundCounter()
//   );
// }, 1000);

// let injectProps: browser.extensionTypes.InjectDetails = {
//   allFrames: true,
//   code: 'console.log("Untraceable Background Injection");',
//   runAt: 'document_start'
// };
//
// injectProps['matchAboutBlank'] = true;
//
// if (chrome) {
//   // chrome.tabs.executeScript(injectProps);
//
//   chrome.tabs.onCreated.addListener(tab => {
//     console.log('tab created');
//     console.log(tab);
//     chrome.tabs.executeScript(tab.id as number, injectProps);
//   });
//
//   chrome.tabs.onUpdated.addListener((tabId, tab) => {
//     console.log('tab updated');
//     console.log(tab);
//     chrome.tabs.executeScript(tabId as number, injectProps);
//   });
// }
// browser.tabs.executeScript(undefined, injectProps);

// browser.storage.local.set({'device': {id: 'MY_ID'}}).then(r => {
//   console.log('Saved to Local Storage!');
//   console.log(r);
// });

// browser.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any): any => {
//     console.log("Background");
//     console.log(request);
//     console.log(sender);
//     sendResponse('BYE');
// });

browser.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == "background");

    port.onDisconnect.addListener(function (msg: any) {
        console.log("disconnected!!!");
    });

    port.onMessage.addListener(function (msg: any) {
        console.log(msg);
        port.postMessage({
                navigator: {
                    userAgent: 'Modilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.2228.0 Safari/537.36'
                }
            }
        );
    });
});


/*
Initialize the UA to Firefox 41.
*/
var ua = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

/*
Rewrite the User-Agent header to "ua".
*/
function rewriteUserAgentHeader(e: any) {
    for (let header of e.requestHeaders) {
        let n = header.name.toLowerCase();

        switch (n) {
            case 'user-agent':
                header.value = ua;
                break;

            case 'accept':
                break;
        }
    }
    return {requestHeaders: e.requestHeaders};
}

/*
Add rewriteUserAgentHeader as a listener to onBeforeSendHeaders,
only for the target page.
Make it "blocking" so we can modify the headers.
*/
browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

/*
Update ua to a new value, mapped from the uaString parameter.
*/
export function setUa(uaString: string) {
    ua = uaString;
}