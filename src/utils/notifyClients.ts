interface Client {
  send: (data: string) => void;
}

const clients: Set<Client> = new Set<Client>();

export function notifyClients(data: unknown) {
  const message = JSON.stringify(data);
  const closedClients: Client[] = [];

  clients.forEach((client) => {
    try {
      client.send(message);
      console.log("Sent message to a client:", message);
    } catch (error) {
      console.error("Failed to send message to a client:", error);
      closedClients.push(client); // Mark the client for removal
    }
  });

  // Remove closed clients from the set
  closedClients.forEach((client) => clients.delete(client));
}

export { clients };