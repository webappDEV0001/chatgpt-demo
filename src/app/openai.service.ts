import { Injectable } from '@angular/core';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'azure-openai';
import { from, of, Observable, flatMap, switchMap } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Card, RequestCard, ResponseCard } from './models';

/**
 * Provides basic RxJS-wrapped Chat Completion service via Azure Open AI.
 */
@Injectable({
    providedIn: 'root'
})
export class OpenAiService {
    openai: OpenAIApi | null = null;

    constructor(private http: HttpClient) {
        this.http.get<any>(`../assets/openai.json`).subscribe(data => {
            const config = data.OpenAI;

            const conf = new Configuration({
                apiKey: config.apiKey,
                azure: {
                  apiKey: config.apiKey,
                  deploymentName: config.deploymentName,
                  endpoint: config.endpoint,
                }
              });
          
            this.openai = new OpenAIApi(conf);
    
            console.info('%c OpenAI Service Started.', 'background: #222; color: #bada55');
        });
    }

    createChatCompletion(input: Card[]): Observable<ResponseCard | null> {
        if (!this.openai) {
            return of(null);
        }

        const completion = this.openai.createChatCompletion({
            model: "gpt-4",
            messages: this.toChatCompletionRequestMessages(input)
        });

        return from(completion).pipe(switchMap(response => {
            const respCard = new ResponseCard;
            respCard.responses = [];

            for(let c of response.data.choices) {
                if (c.message) {
                    respCard.responses.push(c.message.content);
                }
            }

            return of(respCard);
        }));
    }

    private toChatCompletionRequestMessages(input: Card[]) : ChatCompletionRequestMessage[] {
        // Re-supply all the messages that we have sent thus far to ChatGPT; this allows
        // it to maintain temporal reference, otherwise subsequent questions do not get
        // evaluated in the original context and it does not know what we are talking about
        // when referring to past answers.
        const messages = input
        .filter(t => t instanceof RequestCard)
        .map(t => {
            const card = t as RequestCard;
            let output: ChatCompletionRequestMessage[] = [];

            output.push({"role": "user", "content": `${card.content}`});

            if (card.responseCard) {
                output.push({"role": "assistant", "content": `${card.responseCard?.content}`});
            }

            return output;
        });

        return messages.reduce((accumulator, value) => accumulator.concat(value), []);
    }
}