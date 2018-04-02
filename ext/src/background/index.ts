browser.runtime.onMessage.addListener(message => {
  if (message.type === 'GREETING') {
    console.log(message)
    return new Promise(resolve =>
      setTimeout(() => resolve('Hi! Got your message a second ago.'), 1000)
    )
  }
})

browser.runtime.onConnect.addListener(function (port) {
  console.log('Port connected!')
  console.assert(port.name === 'P')

  port.onDisconnect.addListener((event: any) => {
    console.log('disconnected!!!')
  })

  port.onMessage.addListener(function (msg: any) {
    console.log(msg)

    if (msg.type === 'P') {
      port.postMessage({
          navigator: {
            userAgent: 'Modilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.2228.0 Safari/537.36'
          }
        }
      )
    }
  })
})

/*
Initialize the UA to Firefox 41.
*/
let userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
let accept = ''

/*
Rewrite the User-Agent header to "ua".
*/
function rewriteUserAgentHeader (e: any) {
  for (let header of e.requestHeaders) {
    let n = header.name.toLowerCase()

    switch (n) {
      case 'user-agent':
        header.value = userAgent;
        break

      case 'accept':
        accept = ''
        break
    }
  }
  return { requestHeaders: e.requestHeaders }
}

/*
Add rewriteUserAgentHeader as a listener to onBeforeSendHeaders,
only for the target page.
Make it "blocking" so we can modify the headers.
*/
browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,
  { urls: [ '<all_urls>' ] },
  [ 'blocking', 'requestHeaders' ])
