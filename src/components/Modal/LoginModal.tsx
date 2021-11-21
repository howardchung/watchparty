import React from 'react';
import { Modal, Button, Form, Message } from 'semantic-ui-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export class LoginModal extends React.Component<{
  closeLogin: Function;
}> {
  public state = { email: '', password: '', isCreateMode: false, error: '' };

  resetPassword = async () => {
    try {
      await firebase.auth().sendPasswordResetEmail(this.state.email);
      this.props.closeLogin();
    } catch (e: any) {
      // handle exceptions
      this.setState({ error: e.message });
    }
  };

  emailSignIn = async (email: string, password: string) => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      this.props.closeLogin();
    } catch (e: any) {
      // handle exceptions
      this.setState({ error: e.message });
    }
  };

  createAccount = async (email: string, password: string) => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    } catch (e: any) {
      // handle exceptions
      this.setState({ error: e.message });
    }
  };

  emailLinkSignIn = async () => {
    await firebase.auth().sendSignInLinkToEmail(this.state.email, {
      url: window.location.href,
      handleCodeInApp: true,
    });
  };

  render() {
    const { closeLogin } = this.props;
    return (
      <Modal open={true} onClose={closeLogin as any}>
        <Modal.Header>
          {this.state.isCreateMode ? 'Create an account' : 'Login'}
        </Modal.Header>
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
            {!this.state.isCreateMode && (
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="linkButton"
                  onClick={() => this.setState({ isCreateMode: true })}
                >
                  Create one.
                </button>{' '}
                Forgot your password? Enter your email and{' '}
                <button
                  type="button"
                  className="linkButton"
                  onClick={this.resetPassword}
                >
                  reset it.
                </button>
              </div>
            )}
            {this.state.isCreateMode ? (
              <Button
                type="submit"
                onClick={() =>
                  this.createAccount(this.state.email, this.state.password)
                }
              >
                Create
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={() =>
                  this.emailSignIn(this.state.email, this.state.password)
                }
              >
                Login
              </Button>
            )}
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
