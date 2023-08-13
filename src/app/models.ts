export interface Card {
    kind: 'request' | 'response'
    content: string;
}
  
export class RequestCard implements Card {
    prompt: string = '';
    status: 'waiting' | 'done' | 'error' = 'waiting';
    responseCard: ResponseCard | null = null;

    get kind(): 'request' | 'response' { return 'request'; }
    get content(): string { return this.prompt; }
}

export class ResponseCard implements Card {
    responses: string[] = [];
    
    get kind(): 'request' | 'response' { return 'response'; }
    get content(): string { return this.responses[0]; }
}
