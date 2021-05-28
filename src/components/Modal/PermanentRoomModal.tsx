import React from 'react';
import { Modal, Table, Icon } from 'semantic-ui-react';

export class PermanentRoomModal extends React.Component<{
  closeModal: Function;
}> {
  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal as any} closeIcon>
        <Modal.Header>Permanent Rooms</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <div>
              Registered users have the ability to make their rooms permanent.
              Subscribed users can create multiple permanent rooms.
            </div>
            <Table definition unstackable striped celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>Temporary</Table.HeaderCell>
                  <Table.HeaderCell>Permanent</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.Cell>Expiry</Table.Cell>
                  <Table.Cell>After 24 hours of inactivity</Table.Cell>
                  <Table.Cell>Never</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Room Passwords</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Disable Chat</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Kick Users</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Custom Room URLs (subscribers)</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                {/* <Table.Row>
                  <Table.Cell>Max Room Capacity (subscribers)</Table.Cell>
                    <Table.Cell>20</Table.Cell>
                    <Table.Cell>100</Table.Cell>
                  </Table.Row> */}
              </Table.Body>
            </Table>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
