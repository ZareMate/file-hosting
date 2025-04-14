interface Client {
  send: (data: string) => void;
}

const clients: Set<Client> = new Set<Client>();

export function notifyClients(data: unknown) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    try {
      client.send(message);
    } catch (error) {
      console.error("Failed to send message to a client:", error);
    }
  });
}

export { clients };