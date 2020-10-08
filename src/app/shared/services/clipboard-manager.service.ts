import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardManager {
  public supportClipboardAPI: boolean;
  public isClipboardReadGranted: boolean;

  constructor() { 
    this.supportClipboardAPI = Boolean(navigator.clipboard);

    if (this.supportClipboardAPI) {
      // @ts-ignore: see https://github.com/microsoft/TypeScript/issues/33923
      navigator.permissions.query({ name: 'clipboard-read' }).then(result => {
        this.isClipboardReadGranted = result.state === 'granted';
      })
    }
  }

  copy(text: string) {
    if (this.supportClipboardAPI) {
      navigator.clipboard.writeText(text);
    } else {
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    }
  }

  paste():Promise<string> {
    if (this.supportClipboardAPI) {
      return navigator.clipboard.readText();
    } else {
      return new Promise<string>((resolve, reject) => {
        try {
          const dummy = document.createElement("textarea");
          document.body.appendChild(dummy);
          dummy.focus();
          document.execCommand("paste");
          const clipboardData = dummy.value;
          document.body.removeChild(dummy);
          resolve(clipboardData);
        } catch (error) {
          reject('');
        }
      });
    }
  }
}
