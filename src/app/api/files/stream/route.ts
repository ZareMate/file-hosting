import { clients } from "~/utils/notifyClients";

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

      signal.addEventListener("abort", () => {
        clients.delete(client);
        controller.close();
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