import * as React from 'react';
// import { TodoTextInput } from 'app/components/TodoTextInput';
import {TodoModel} from 'app/models/TodoModel';
// import {Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Button, Alignment} from "@blueprintjs/core";
import {Button, Dialog, Intent} from '@blueprintjs/core'

export interface HeaderProps {
  addTodo: (todo: Partial<TodoModel>) => any;
}

export interface HeaderState {
  /* empty */
  isOpen: boolean;
}

export class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props)
    this.state = {
      isOpen: false,
    }
  }
  // private handleSave = (text: string) => {
  //   if (text.length) {
  //     this.props.addTodo({ text });
  //   }
  // };
  private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });

  render () {
    return (
      <nav className="pt-navbar pt-dark">
        <div style={{ margin: '0 auto', minWidth: '480px' }}>
          <div className="pt-navbar-group pt-align-left">
            {/*<div className="pt-navbar-heading">Untraceable</div>*/}
            {/*<input class="pt-input" placeholder="Search files..." type="text" />*/}
            {/*<span className="pt-navbar-divider" />*/}
            <button className="pt-button pt-minimal pt-icon-home pt-active">Dashboard</button>
            <button className="pt-button pt-minimal pt-icon-document">Fingerprints</button>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <button className="pt-button pt-minimal pt-icon-user" />
            <button className="pt-button pt-minimal pt-icon-notifications" />
            <button className="pt-button pt-minimal pt-icon-cog" onClick={this.toggleDialog} />
          </div>
        </div>

        <Dialog
          icon="inbox"
          isOpen={this.state.isOpen}
          onClose={this.toggleDialog}
          title="Dialog header"
          className="pt-dark"
        >
          <div className="pt-dialog-body">Some content</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button text="Secondary"/>
              <Button
                intent={Intent.PRIMARY}
                onClick={this.toggleDialog}
                text="Primary"
              />
            </div>
          </div>
        </Dialog>
      </nav>
    );
  }
}

export default Header;
