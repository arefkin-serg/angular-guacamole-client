import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, ElementRef,
         ViewChild, Renderer2, HostListener, ChangeDetectionStrategy } from '@angular/core';

import { Display, Keyboard, Mouse } from 'guacamole-common-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RemoteDesktopManager } from '@shared/services/remote-desktop-manager.service';
import { ClipboardManager } from '@shared/services/clipboard-manager.service';

@Component({
  selector: 'app-remote-desktop-display',
  templateUrl: './remote-desktop-display.component.html',
  styleUrls: ['./remote-desktop-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteDesktopDisplayComponent implements OnInit, OnDestroy, AfterViewInit {
  private keyboard: Keyboard;
  private mouse: Mouse;
  private rdpDisplay: Display;
  public alive$: Subject<void> = new Subject();
  public isFocused: boolean;

  @Output() onMouseMove = new BehaviorSubject(null);
  @Input()  manager: RemoteDesktopManager;
  @ViewChild('display') display: ElementRef;
  
  @HostListener('window:blur', ['$event'])
  private onWindowBlur(event: any): void {
    this.manager.setFocused(false);
  }

  @HostListener('window:resize', ['$event'])
  private onWindowResize(event: any): void {
    this.setDisplayScale();
  }

  @HostListener('document:click', ['$event'])
  private onClickOutside(event: any): void {
    this.manager.setFocused(false);
  }
  
  @HostListener('click', ['$event'])
  private onClickInside(event: MouseEvent): void {
    if (!this.isFocused) {
      this.manager.setFocused(true);
    }
    event.stopPropagation();
  }

  constructor(private viewport: ElementRef, 
              private renderer: Renderer2,
              private clipboardManager: ClipboardManager) { }

  ngOnInit(): void {
    this.bindSubscriptions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createDisplayCanvas();
    }, 100);
  }

  ngOnDestroy(): void {
    this.removeDisplay();
    this.removeDisplayInputListeners();
    this.alive$.next();
    this.alive$.complete();
  }

  get displayProportion():string {
    if (!this.rdpDisplay) return '0';
    return `${100 * this.rdpDisplay.getHeight() / this.rdpDisplay.getWidth()}%`;
  }

  private createDisplayCanvas(): void {
    this.createDisplay();
    this.createDisplayInputs();
    this.bindDisplayInputListeners();
  }

  private bindSubscriptions(): void {
    this.manager.onKeyboardReset.pipe(takeUntil(this.alive$)).subscribe(_ => this.resetKeyboard());
    this.manager.onFocused.pipe(takeUntil(this.alive$)).subscribe(this.handleFocused.bind(this));
    this.manager.onFullScreen.pipe(takeUntil(this.alive$)).subscribe(isFullscreen => {
      if (isFullscreen) {
        this.setDisplayScale(true);
        this.manager.setFocused(true);
      }
    });
  }

  private handleFocused(newFocused: boolean): void {
    this.isFocused = newFocused;
    if (newFocused) {
      this.bindDisplayInputListeners();
      setTimeout(() => {
        this.sendClipboard();
      }, 50);
    } else {
      this.removeDisplayInputListeners();
    }
  }

  private setDisplayScale(isOriginalSize = false) {
    const scale = isOriginalSize ? 1 : this.calculateDisplayScale(this.rdpDisplay);
    this.rdpDisplay.scale(scale);
  }

  private calculateDisplayScale(display: Display): number {
    const viewportElement = this.viewport.nativeElement;
    const scale = Math.min(viewportElement.clientWidth / display.getWidth(),
                           viewportElement.clientHeight / display.getHeight());
    return scale;
  }

  private createDisplay(): void {
    const element = this.display.nativeElement;
    this.rdpDisplay = this.manager.getClient().getDisplay();
    this.renderer.appendChild(element, this.rdpDisplay.getElement());
    this.setDisplayScale();
  }

  private removeDisplay(): void {
    const element = this.display.nativeElement;
    this.renderer.removeChild(element, this.rdpDisplay.getElement());
  }
  
  private bindDisplayInputListeners(): void {
    this.removeDisplayInputListeners();
    if (this.mouse) {
      this.mouse.onmousedown = this.mouse.onmouseup = this.mouse.onmousemove = this.handleMouseState.bind(this);
    }
    if (this.keyboard) {
      this.keyboard.onkeyup = this.handleKeyUp.bind(this);
      this.keyboard.onkeydown = this.handleKeyDown.bind(this);
    }
  }

  private removeDisplayInputListeners(): void {
    if (this.keyboard) {
      this.keyboard.onkeydown = null;
      this.keyboard.onkeyup = null;
    }
    if (this.mouse) {
      this.mouse.onmousedown = this.mouse.onmouseup = this.mouse.onmousemove = null;
    }
  }

  private createDisplayInputs(): void {
    const display = this.display.nativeElement.children[0];
    this.mouse = new Mouse(display);
    this.keyboard = new Keyboard(window.document);
  }

  private handleMouseState(mouseState: any): void {
    const scale = this.rdpDisplay.getScale();
    const scaledState = new Mouse.State(
      mouseState.x / scale,
      mouseState.y / scale,
      mouseState.left,
      mouseState.middle,
      mouseState.right,
      mouseState.up,
      mouseState.down);
    this.manager.getClient().sendMouseState(scaledState);
    this.onMouseMove.next(mouseState);
  }

  private resetKeyboard(): void {
    if (this.keyboard) {
      this.keyboard.reset();
    }
  }

  private handleKeyDown(key: any): void {
    this.manager.getClient().sendKeyEvent(1, key);
  }

  private handleKeyUp(key: any): void {
    this.manager.getClient().sendKeyEvent(0, key);
  }

  private sendClipboard() {
    this.clipboardManager.paste().then(
      text => {this.manager.sendRemoteClipboardData(text)}, 
      error => {console.warn(error)}
    );
  }
}
