import * as React from 'react'
import * as ReactDOM from 'react-dom'

import './index.scss'
const logo = require('../assets/logo.png')

class App extends React.Component<{}, any> {
  render () {
    return (
      <div className='App'>
        <div className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          {/*<h2>Untraceable</h2>*/}
          <div className='App-logo-title'>Untraceable</div>
        </div>
        <p className='App-intro'>
          Burner Fingerprint Installed
        </p>
        <p>
          {/*<Spinner className={Classes.SMALL} intent={Intent.PRIMARY} />*/}

          {/*<button type='button' className='pt-button pt-intent-success'>*/}
          {/*Next step*/}
          {/*<span className='pt-icon-standard pt-icon-arrow-right pt-align-right'></span>*/}
          {/*</button>*/}
          {/*<button type='button' className='pt-button'>*/}
          {/*<span className='pt-icon-standard pt-icon-user'></span>*/}
          {/*Profile settings*/}
          {/*<span className='pt-icon-standard pt-icon-caret-down pt-align-right'></span>*/}
          {/*</button>*/}
          {/*<button type='button' className='pt-button pt-intent-danger'>*/}
          {/*Reset*/}
          {/*<span className='pt-icon-standard pt-icon-refresh pt-align-right'></span>*/}
          {/*</button>*/}
          {/*<button type='button' className='pt-button pt-large'>*/}
          {/*<span className='pt-icon-standard pt-icon-document'></span>*/}
          {/*upload.txt*/}
          {/*<span className='pt-icon-standard pt-icon-cross pt-align-right'></span>*/}
          {/*</button>*/}
        </p>
      </div>
    )
  }
}

ReactDOM.render(
  <div>
    <App/>
  </div>,
  document.getElementById('root')
)
