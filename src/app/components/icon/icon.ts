import { Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'close'
  | 'phone'
  | 'whatsapp'
  | 'instagram'
  | 'map-pin'
  | 'check-circle'
  | 'chevron-down'
  | 'truck'
  | 'stack'
  | 'box'
  | 'sofa'
  | 'bed'
  | 'dining'
  | 'chair'
  | 'wardrobe';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
    >
      @switch (name()) {
        @case ('search') {
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="20" y1="20" x2="15.5" y2="15.5"></line>
        }
        @case ('close') {
          <line x1="6" y1="6" x2="18" y2="18"></line>
          <line x1="18" y1="6" x2="6" y2="18"></line>
        }
        @case ('phone') {
          <path
            d="M6.5 3 H9.5 L11 7 L8.7 8.7 C9.6 10.8 11.2 12.4 13.3 13.3 L15 11 L19 12.5 V15.5 C19 17.4 17.4 19 15.5 19 C9.7 19 5 14.3 5 8.5 C5 6.6 5.6 4.9 6.5 3 Z"
          ></path>
        }
        @case ('whatsapp') {
          <path
            fill="currentColor"
            stroke="none"
            d="M17.6 6.3A8.8 8.8 0 0 0 3.3 16.4L2 21l4.7-1.2A8.8 8.8 0 0 0 17.6 6.3ZM11 19.3a7.3 7.3 0 0 1-3.7-1l-.3-.2-2.8.7.7-2.7-.2-.3a7.3 7.3 0 1 1 13.5-3.9A7.3 7.3 0 0 1 11 19.3Zm4-5.5c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.4-.8-2-1.4-.5-.5-.9-1.1-1.1-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3.1-.4 0-.1-.5-1.2-.6-1.6-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.5 4 3.4.6.2 1 .4 1.3.5.6.2 1.1.1 1.5-.1.5-.2 1.3-.9 1.5-1.3.2-.4.2-.8.1-.9-.1-.1-.2-.2-.4-.3Z"
          ></path>
        }
        @case ('instagram') {
          <rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect>
          <circle cx="12" cy="12" r="4"></circle>
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"></circle>
        }
        @case ('map-pin') {
          <path
            d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11Z"
          ></path>
          <circle cx="12" cy="10" r="2.3"></circle>
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8 12.2 L10.7 15 L16 9"></path>
        }
        @case ('chevron-down') {
          <path d="M6 9 L12 15 L18 9"></path>
        }
        @case ('truck') {
          <rect x="2" y="7" width="12" height="9" rx="1"></rect>
          <path d="M14 10 H18 L21 13.2 V16 H14 Z"></path>
          <circle cx="6.5" cy="18" r="1.8"></circle>
          <circle cx="17.5" cy="18" r="1.8"></circle>
        }
        @case ('stack') {
          <path d="M12 3 L21 7.5 L12 12 L3 7.5 Z"></path>
          <path d="M3 12 L12 16.5 L21 12"></path>
          <path d="M3 16.5 L12 21 L21 16.5"></path>
        }
        @case ('box') {
          <path d="M3 8 L12 4 L21 8 L21 17 L12 21 L3 17 Z"></path>
          <path d="M3 8 L12 12 L21 8"></path>
          <line x1="12" y1="12" x2="12" y2="21"></line>
        }
        @case ('sofa') {
          <rect x="4" y="11" width="16" height="6.5" rx="1"></rect>
          <path d="M5.5 11 V8.5 A1.5 1.5 0 0 1 7 7 H17 A1.5 1.5 0 0 1 18.5 8.5 V11"></path>
          <line x1="4.5" y1="17.5" x2="4.5" y2="19"></line>
          <line x1="19.5" y1="17.5" x2="19.5" y2="19"></line>
        }
        @case ('bed') {
          <rect x="3" y="6" width="3.2" height="12" rx="0.6"></rect>
          <rect x="6.2" y="12" width="14.8" height="6" rx="1"></rect>
          <path d="M8.5 12 V9.3 H12.5 V12"></path>
        }
        @case ('dining') {
          <rect x="3" y="6" width="18" height="2.4" rx="0.6"></rect>
          <line x1="5.2" y1="8.4" x2="5.2" y2="19"></line>
          <line x1="18.8" y1="8.4" x2="18.8" y2="19"></line>
        }
        @case ('chair') {
          <rect x="7" y="11" width="10" height="2.4" rx="0.6"></rect>
          <path d="M8 11 V6.3 A1 1 0 0 1 9 5.3 H15 A1 1 0 0 1 16 6.3 V11"></path>
          <line x1="8" y1="13.4" x2="8" y2="19"></line>
          <line x1="16" y1="13.4" x2="16" y2="19"></line>
        }
        @case ('wardrobe') {
          <rect x="5" y="3" width="14" height="18" rx="1"></rect>
          <line x1="12" y1="3" x2="12" y2="21"></line>
          <line x1="10" y1="11" x2="10" y2="13"></line>
          <line x1="14" y1="11" x2="14" y2="13"></line>
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
      .icon {
        display: block;
      }
    `,
  ],
})
export class Icon {
  name = input.required<IconName>();
  size = input<number>(20);
}
