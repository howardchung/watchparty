import React from "react";
import { Modal, Table } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export const PermanentRoomModal = (props: { closeModal: () => void }) => {
  const { closeModal } = props;
  return (
    <Modal opened onClose={closeModal} title="Permanent Rooms">
      <div>
        Registered users have the ability to make their rooms permanent.
        Subscribed users can create multiple permanent rooms.
      </div>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Temporary</Table.Th>
            <Table.Th>Permanent</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Expiry</Table.Td>
            <Table.Td>After 24 hours of inactivity</Table.Td>
            <Table.Td>Never</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Room Passwords</Table.Td>
            <Table.Td></Table.Td>
            <Table.Td>
              <IconCheck />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Disable Chat</Table.Td>
            <Table.Td></Table.Td>
            <Table.Td>
              <IconCheck />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Kick Users</Table.Td>
            <Table.Td></Table.Td>
            <Table.Td>
              <IconCheck />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Custom Room URLs (subscribers)</Table.Td>
            <Table.Td></Table.Td>
            <Table.Td>
              <IconCheck />
            </Table.Td>
          </Table.Tr>
          {/* <Table.Tr>
                  <Table.Td>Max Room Capacity (subscribers)</Table.Td>
                    <Table.Td>20</Table.Td>
                    <Table.Td>100</Table.Td>
                  </Table.Tr> */}
        </Table.Tbody>
      </Table>
    </Modal>
  );
};
