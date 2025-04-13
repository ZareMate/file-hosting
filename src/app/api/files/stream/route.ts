import { NextResponse } from "next/server";

const clients: Set<any> = new Set();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const abortController = new AbortController();
      const signal = abortController.signal;

      const client = {
        send: (data: string) => {
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        },
        close: () => {
          controller.close();
          abortController.abort();
        },
      };

      clients.add(client);

      // Remove the client when the stream is closed
      const abortListener = () => {
        clients.delete(client);
        controller.close(); // Ensure the stream is closed when the client disconnects
      };
      signal.addEventListener("abort", abortListener);

      // Cleanup the abort listener when the stream is closed
      signal.addEventListener("abort", () => {
        signal.removeEventListener("abort", abortListener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Notify all connected clients about a file change
export function notifyClients(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    try {
      client.send(message);
    } catch (error) {
      console.error("Failed to send message to a client:", error);
    }
  });
}