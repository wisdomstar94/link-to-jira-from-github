export class DomObserver {
  target?: HTMLElement | null;
  isSubscribing: boolean = false;
  defaultObserverOptions?: MutationObserverInit;
  callbacks: Array<(mutations: MutationRecord[]) => void> = [];
  observer?: MutationObserver;

  constructor(selector: string, options?: MutationObserverInit) {
    this.target = document.querySelector(selector);
    this.defaultObserverOptions = options;
    this.subscribe();
  }

  subscribe(options?: MutationObserverInit) {
    if (this.target === null || this.target === undefined) return;
    if (this.isSubscribing) {
      console.warn('이미 subscribe 중입니다.');
      return;
    }

    this.isSubscribing = true;
    const applyOptions = options ?? this.defaultObserverOptions;
  
    this.observer = new MutationObserver((mutations) => {
      this.callbacks.forEach((callback) => callback(mutations));
    });
    this.observer.observe(this.target, applyOptions);
  } 

  unsubscribe() {
    if (!this.isSubscribing) return;
    this.isSubscribing = false;
    this.observer?.disconnect();
  }

  setCallback(callback: (mutations: MutationRecord[]) => void) {
    this.callbacks.push(callback);
  }
}