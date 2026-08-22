import { Response } from 'express';

interface ClientConnection {
  documentId: string;
  res: Response;
}

class SSEService {
  private clients: ClientConnection[] = [];

  addClient(documentId: string, res: Response) {
    this.clients.push({ documentId, res });
    res.on('close', () => {
      this.removeClient(res);
    });
  }

  removeClient(res: Response) {
    this.clients = this.clients.filter((client) => client.res !== res);
  }

  sendProgress(documentId: string, data: { status: string; progress: number; message: string; payload?: any }) {
    const targetClients = this.clients.filter((c) => c.documentId === documentId);
    targetClients.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}

export const sseService = new SSEService();
