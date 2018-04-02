import * as React from "react";
import {Component, PropTypes} from "react";
import * as actions from '../actions/popup';
import {connect} from 'react-redux';

interface PopupProps {
    backgroundCounter: number,
    uiCounter: number,
    incrementUICounter: any,
    decrementUICounter: any,
}

interface PopupState {
    activeTab: browser.tabs.Tab | null
    info: {
        name: string,
        vendor: string,
        version: string,
        buildID: string,
    } | null
}

class ActiveTabPopup extends Component {
    // static propTypes = {
    //     backgroundCounter: PropTypes.number.isRequired,
    //     uiCounter: PropTypes.number.isRequired,
    //     incrementUICounter: PropTypes.func.isRequired,
    //     decrementUICounter: PropTypes.func.isRequired
    // };

    state: PopupState;
    props: PopupProps;

    constructor(props: PopupProps) {
        super(props);
        this.state = {activeTab: null, info: null};
    }

    componentDidMount() {
        browser.runtime.getBrowserInfo().then(value => {
            this.setState({info: value});
        });

        // Get the active tab and store it in component state.
        browser.tabs.query({active: true}).then(
            tabs => this.setState({activeTab: tabs[0]})
        );
    }

    render() {
        const {activeTab, info} = this.state;
        const {
            backgroundCounter,
            uiCounter,
            incrementUICounter,
            decrementUICounter
        } = this.props;

        return (
            <div>
                <div style={{textAlign: 'center'}}>
          <span style={{lineHeight: '24px'}}>
          <img src="images/icons/24x24.png"/>
          </span>
                    <span style={{lineHeight: '24px', verticalAlign: 'top', paddingLeft: '8px', fontSize: '18px'}}>
            Fingerprint Patch
          </span>
                </div>
                <p>
                    <div style={{textAlign: 'center'}}>
                        <span style={{padding: '5px 10px', backgroundColor: '#555'}}>Patch successfully installed</span>
                    </div>
                </p>
                <p>
                    {info ? info.name + " - " + info.vendor + " - " + info.buildID : 'no info'}
                </p>
                <p>
                Active tab: {activeTab ? activeTab.url : '[waiting for result]'}
                </p>
                {/*<Nested />*/}
                {/*<div style={{ width: 200 }}>*/}
                {/*<div>*/}
                {/*Background counter: {backgroundCounter}*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*UI counter: {uiCounter}*/}
                {/*<div>*/}
                {/*<button onClick={decrementUICounter}>-</button>*/}
                {/*<span> </span>*/}
                {/*<button onClick={incrementUICounter}>+</button>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
            </div>
        );
    }
}

let myactions = {
    "incrementUICounter": actions.incrementUICounter,
    "decrementUICounter": actions.decrementUICounter,
};

export default connect(state => state, myactions)(ActiveTabPopup);