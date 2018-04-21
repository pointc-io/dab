import { h, Component, render } from 'preact'

import './index.scss'
const logo = require('../assets/logo.png')

interface AppProps {
}

interface AppState {
}

class App extends Component<AppProps, AppState> {

  render (props: AppProps, state) {
    return (
      <div className='App'>
        <div className='App-header'>
          <img src={logo} className='App-logo' alt='logo'/>
          <div className='App-logo-title'>Untraceable</div>
        </div>
        <p className='App-intro'>
          Burner Fingerprint Installed
        </p>
        <p>
        </p>
      </div>
    )
  }
}

render(
  <App />,
  document.getElementById('root')
)
