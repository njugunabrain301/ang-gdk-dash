import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AgentService } from '../../services/agent.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-store-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './store-manager.component.html',
  styleUrls: ['./store-manager.component.css'],
})
export class StoreManagerComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  currentQuery = '';
  isLoading = false;
  private shouldScroll = false;

  constructor(
    private agentService: AgentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Add welcome message
    this.messages.push({
      role: 'assistant',
      content:
        "Hello! I'm your Store Manager AI assistant. I can help you with questions about your products, orders, statistics, and more. How can I assist you today?",
      timestamp: new Date(),
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage() {
    if (!this.currentQuery.trim() || this.isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.currentQuery.trim(),
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    const query = this.currentQuery.trim();
    this.currentQuery = '';
    this.isLoading = true;
    this.shouldScroll = true;

    this.agentService.queryAgent(query).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.data) {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date(),
          };
          this.messages.push(assistantMessage);
        } else {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: `Sorry, I encountered an error: ${
              response.message || response.error || 'Unknown error'
            }`,
            timestamp: new Date(),
          };
          this.messages.push(errorMessage);
          this.snackBar.open('Error processing query', 'Close', {
            duration: 3000,
          });
        }
        this.shouldScroll = true;
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${
            error.error?.message ||
            error.message ||
            'Failed to connect to the agent'
          }`,
          timestamp: new Date(),
        };
        this.messages.push(errorMessage);
        this.shouldScroll = true;
        this.snackBar.open('Error connecting to agent', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Ignore scroll errors
    }
  }
}
