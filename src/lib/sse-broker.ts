type SseSend = (chunk: string) => void;

type SseClient = {
  id: string;
  userId: string;
  send: SseSend;
};

class SseBroker {
  private clients = new Map<string, SseClient>();

  addClient(userId: string, send: SseSend) {
    const id = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    this.clients.set(id, {
      id,
      userId,
      send,
    });

    return {
      id,
      remove: () => {
        this.clients.delete(id);
      },
    };
  }

  publishToUser(userId: string, event: string, payload: unknown) {
    const chunk = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

    for (const [clientId, client] of this.clients.entries()) {
      if (client.userId !== userId) continue;

      try {
        client.send(chunk);
      } catch {
        this.clients.delete(clientId);
      }
    }
  }

  count(userId?: string) {
    if (!userId) return this.clients.size;

    let total = 0;

    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        total += 1;
      }
    }

    return total;
  }
}

type SseGlobal = typeof globalThis & {
  __taskSseBroker?: SseBroker;
};

const globalForSse = globalThis as SseGlobal;

export const sseBroker = globalForSse.__taskSseBroker ?? new SseBroker();

if (process.env.NODE_ENV !== 'production') {
  globalForSse.__taskSseBroker = sseBroker;
}
