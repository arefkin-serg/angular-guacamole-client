import { Component, OnInit, OnDestroy, AfterViewInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RemoteDesktopManager } from '@shared/services/remote-desktop-manager.service';
import { ClipboardManager } from '@shared/services/clipboard-manager.service';
import * as screenfull from 'screenfull';

@Component({
  selector: 'app-remote-desktop',
  templateUrl: './remote-desktop.component.html',
  styleUrls: ['./remote-desktop.component.less']
})
export class RemoteDesktopComponent implements OnInit, OnDestroy, AfterViewInit {
  public states = States;
  public state: BehaviorSubject<States> = new BehaviorSubject<States>(this.states.CONNECTING);
  public alive$: Subject<void> = new Subject();
  public componentMinHeight: string;
  public isFullscreen: boolean;
  
  @Input() manager: RemoteDesktopManager;

  @ViewChild('container')
  private container: ElementRef;

  @HostListener('window:resize', ['$event'])
  private onWindowResize(event: any): void {
    this.calculateComponentHeight();
  }

  constructor(private element: ElementRef, 
              private clipboardManager: ClipboardManager) { }

  ngOnInit(): void {
    this.manager.onStateChange.pipe(takeUntil(this.alive$)).subscribe(this.handleState.bind(this));
    this.manager.onFullScreen.pipe(takeUntil(this.alive$)).subscribe(isFullscreen => {
      this.handleFullScreen(isFullscreen);
    });
    this.manager.onRemoteClipboardData.pipe(takeUntil(this.alive$)).subscribe(text => {
      this.clipboardManager.copy(<string>text);
    });

    if (screenfull.isEnabled) {
      screenfull.on('change', () => {
        if (screenfull.isEnabled) this.isFullscreen = screenfull.isFullscreen;
        this.manager.setFullScreen(this.isFullscreen);
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculateComponentHeight();
    }, 100);
  }

  ngOnDestroy(): void {
    this.alive$.next();
    this.alive$.complete();
  }

  private setState(newState: States): void {
    this.state.next(newState);
  }

  private handleState(newState: States) {
    console.log(newState);
    
    switch (newState) {
      case RemoteDesktopManager.STATE.CONNECTED:
        this.setState(this.states.CONNECTED);
        break;
      case RemoteDesktopManager.STATE.DISCONNECTED:
        // this.exitFullScreen();
        this.setState(this.states.DISCONNECTED);
        break;
      case RemoteDesktopManager.STATE.CONNECTING:
      case RemoteDesktopManager.STATE.WAITING:
        this.setState(this.states.CONNECTING);
        break;
      case RemoteDesktopManager.STATE.CLIENT_ERROR:
      case RemoteDesktopManager.STATE.TUNNEL_ERROR:
        // this.exitFullScreen();
        this.setState(this.states.ERROR);
        break;
    }
  }

  private handleFullScreen(newFullScreen: boolean): void {
    if (newFullScreen) {
      this.enterFullScreen();
    } else {
      this.exitFullScreen();
    }
  }

  private enterFullScreen(): void {
    if (this.isFullscreen) return;
    if (screenfull.isEnabled) {
      screenfull.request(this.container.nativeElement);
    }
  }

  private exitFullScreen(): void {
    if (!this.isFullscreen) return;
    if (screenfull.isEnabled) {
      screenfull.exit();
    }
  }

  handleDisplayMouseMove(e: MouseEvent) {
  }

  handleEnterFullScreen() {
    this.manager.setFullScreen(true);
  }

  handleExitFullScreen() {
    this.manager.setFullScreen(false);
  }

  calculateComponentHeight():void {
    const componentWidth = this.element.nativeElement.offsetWidth;
    this.componentMinHeight = `${Math.ceil(componentWidth * (window.screen.height / window.screen.width))-2}px`;
  }

}

export enum States {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}