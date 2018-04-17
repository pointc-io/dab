let USER_AGENT = 'Modilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.2228.0 Safari/537.36'
let ACCEPT = ''

browser.runtime.onMessage.addListener(message => {
  if (message.type === 'GREETING') {
    console.log(message)
    return new Promise(resolve =>
      setTimeout(() => resolve('Hi! Got your message a second ago.'), 1000)
    )
  }
})

// Connect to native message host
let NATIVE = browser.runtime.connectNative('me.untraceable.messagehost')
NATIVE.onDisconnect.addListener((port) => {
  console.log('Native Message Host not installed!!!')
  console.log(NATIVE.error)
})
NATIVE.onMessage.addListener(message => {
  console.log('Native Message Received')
  console.log(message)
})
NATIVE.postMessage({ type: 'HI_HI' })

browser.runtime.onConnect.addListener(function (port) {
  port.onDisconnect.addListener((event: any) => {
    console.log('disconnected!!!')
  })

  port.onMessage.addListener(function (msg: any) {
    // Ignore
  })
})

/**
 * Rewrite the User-Agent header to "ua".
 */
function rewriteUserAgentHeader (e: any) {
  for (let header of e.requestHeaders) {
    let n = header.name.toLowerCase()
    switch (n) {
      // case 'user-agent':
      //   header.value = USER_AGENT
      //   break

      case 'accept':
        break
    }
  }
  return { requestHeaders: e.requestHeaders }
}

/**
 * Add rewriteUserAgentHeader as a listener to onBeforeSendHeaders,
 * only for the target page.
 * Make it "blocking" so we can modify the headers.
 */
browser.webRequest.onBeforeSendHeaders.addListener(
  rewriteUserAgentHeader,
  { urls: [ '<all_urls>' ] },
  [ 'blocking', 'requestHeaders' ]
)

function patchWebRTCLeak () {
  // Plug WebRTC local IP leak
  if (chrome && chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCNonProxiedUdpEnabled) {
    chrome.privacy.network.webRTCNonProxiedUdpEnabled.set({ value: false })
  }
}

patchWebRTCLeak()
