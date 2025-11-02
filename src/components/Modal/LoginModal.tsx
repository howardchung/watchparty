import React from 'react';
import {
  Modal,
  Button,
  Alert,
  TextInput,
  PasswordInput,
  Divider,
} from '@mantine/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import styles from './LoginModal.module.css';

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
        <Modal opened onClose={closeModal} title="Login" size="auto" centered>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {this.state.error && (
              <Alert color="red" title="Error">
                {this.state.error}
              </Alert>
            )}
            <TextInput
              label="Email"
              placeholder="Email"
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
            />
            <Button
              type="submit"
              onClick={() =>
                this.emailSignIn(this.state.email, this.state.password)
              }
            >
              Login
            </Button>
            {!this.state.showCreate && (
              <>
                <Divider />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    size="xs"
                    onClick={() => this.setState({ showCreate: true })}
                  >
                    Create account
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => this.setState({ showReset: true })}
                  >
                    Reset password
                  </Button>
                </div>
              </>
            )}
          </div>
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
      <Modal
        opened
        onClose={closeModal}
        title="Create an account"
        size="auto"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {this.state.error && (
            <Alert color="red" title="Error">
              {this.state.error}
            </Alert>
          )}
          <TextInput
            label="Email"
            placeholder="Email"
            value={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
          />
          <Button
            type="submit"
            onClick={() =>
              this.createAccount(this.state.email, this.state.password)
            }
          >
            Create
          </Button>
        </div>
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
      <Modal opened onClose={closeModal} title="Reset password" centered>
        {this.state.error && (
          <Alert color="red" title="Error">
            {this.state.error}
          </Alert>
        )}
        <TextInput
          label="Email"
          placeholder="Email"
          value={this.state.email}
          onChange={(e) => this.setState({ email: e.target.value })}
        />
        <Button
          style={{ marginTop: '8px' }}
          type="submit"
          onClick={() => this.resetPassword()}
        >
          Reset
        </Button>
      </Modal>
    );
  }
}
