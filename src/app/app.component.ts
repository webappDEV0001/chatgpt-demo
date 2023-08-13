import { Component } from '@angular/core';
import { OpenAiService } from './openai.service';
import { ChatCompletionRequestMessage } from 'azure-openai';
import { Card, RequestCard, ResponseCard } from './models';

/**
 * This is a small sample angular application that shows basic hook-up of Azure GPT-4 with a
 * simple chat output display for the GPT Hackathon.
 * 
 * To run, navigate to the root folder, perform `npm install` if you havent, then run `ng serve`
 * in your command prompt/shell.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-openai';

  input: string = '';

  cards: Card[] = [];

  constructor(private openAi: OpenAiService) {
    
  }

  getPrompt(card: Card) : string | null {
    if (card instanceof RequestCard) {
      return card.prompt;
    }

    return null;
  }

  getResponses(card: Card) : string[] | null {
    if (card instanceof ResponseCard) {
      return card.responses;
    }

    return null;
  }

  showSpinner(card: Card): boolean {
    if (card instanceof RequestCard) {
      if (card.status === 'waiting') {
        return true;
      }
    }

    return false;
  }

  onAsk(): void {
    if (!this.input) {
      return;
    }

    const reqCard = new RequestCard;
    reqCard.prompt = this.input;
    reqCard.status = 'waiting';

    this.cards.push(reqCard);

    this.openAi.createChatCompletion(this.cards).subscribe(respCard => {
      if (respCard === null) {
        return;
      }

      reqCard.status = 'done';
      reqCard.responseCard = respCard;

      this.cards.push(respCard);
    });

    this.input = '';
  }
}
