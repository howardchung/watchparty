import React from 'react';
import { Modal, Button, Form, Message } from 'semantic-ui-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export class LoginModal extends React.Component<{
  closeModal: () => void;
}> {
  public state = {
    email: '',
    password: '',
    showCreate: false,
    showReset: false,
    error: '',
  };

  emailSignIn = async (email: string, password: string) => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      this.props.closeModal();
    } catch (e: any) {
      // handle exceptions
      this.setState({ error: e.message });
    }
  };

  // emailLinkSignIn = async () => {
  //   await firebase.auth().sendSignInLinkToEmail(this.state.email, {
  //     url: window.location.href,
  //     handleCodeInApp: true,
  //   });
  // };

  render() {
    const { closeModal } = this.props;
    return (
      <>
        {this.state.showCreate && (
          <CreateModal
            closeModal={() => this.setState({ showCreate: false })}
          />
        )}
        {this.state.showReset && (
          <ResetModal closeModal={() => this.setState({ showReset: false })} />
        )}
        <Modal open={true} onClose={closeModal}>
          <Modal.Header>{'Login'}</Modal.Header>
          <Modal.Content>
            {this.state.error && (
              <Message color="red" header="Error" content={this.state.error} />
            )}
            <Form>
              <Form.Field>
                <label>Email</label>
                <input
                  placeholder="Email"
                  value={this.state.email}
                  onChange={(e) => this.setState({ email: e.target.value })}
                />
              </Form.Field>
              <Form.Field>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </Form.Field>
              {!this.state.showCreate && (
                <div>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="linkButton"
                    onClick={() => this.setState({ showCreate: true })}
                  >
                    Create one.
                  </button>{' '}
                  Forgot your password?{' '}
                  <button
                    type="button"
                    className="linkButton"
                    onClick={() => this.setState({ showReset: true })}
                  >
                    Reset it.
                  </button>
                </div>
              )}
              <Button
                type="submit"
                onClick={() =>
                  this.emailSignIn(this.state.email, this.state.password)
                }
              >
                Login
              </Button>
            </Form>
          </Modal.Content>
        </Modal>
      </>
    );
  }
}

export class CreateModal extends React.Component<{
  closeModal: () => void;
}> {
  public state = { email: '', password: '', error: '' };

  createAccount = async (email: string, password: string) => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    } catch (e: any) {
      // handle exceptions
      this.setState({ error: e.message });
    }
  };

  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal}>
        <Modal.Header>{'Create an account'}</Modal.Header>
        <Modal.Content>
          {this.state.error && (
            <Message color="red" header="Error" content={this.state.error} />
          )}
          <Form>
            <Form.Field>
              <label>Email</label>
              <input
                placeholder="Email"
                value={this.state.email}
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </Form.Field>
            <Form.Field>
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </Form.Field>
            <Button
              type="submit"
              onClick={() =>
                this.createAccount(this.state.email, this.state.password)
              }
            >
              Create
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}

export class ResetModal extends React.Component<{
  closeModal: () => void;
}> {
  public state = { email: '', password: '', error: '' };

  resetPassword = async () => {
    try {
      await firebase.auth().sendPasswordResetEmail(this.state.email);
      this.props.closeModal();
    } catch (e: any) {
      // handle exceptions
      this.setState({ error: e.message });
    }
  };

  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal}>
        <Modal.Header>Reset Password</Modal.Header>
        <Modal.Content>
          {this.state.error && (
            <Message color="red" header="Error" content={this.state.error} />
          )}
          <Form>
            <Form.Field>
              <label>Email</label>
              <input
                placeholder="Email"
                value={this.state.email}
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </Form.Field>
            <Button type="submit" onClick={() => this.resetPassword()}>
              Reset
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
