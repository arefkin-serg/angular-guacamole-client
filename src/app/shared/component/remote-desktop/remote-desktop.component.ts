import { Component, OnInit, OnDestroy, AfterViewInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebSocketTunnel } from 'guacamole-common-js';
import { RemoteDesktopManager } from '@shared/services/remote-desktop-manager.service';
import { ClipboardManager } from '@shared/services/clipboard-manager.service';
import * as screenfull from 'screenfull';
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-remote-desktop',
  templateUrl: './remote-desktop.component.html',
  styleUrls: ['./remote-desktop.component.less']
})
export class RemoteDesktopComponent implements OnInit, OnDestroy, AfterViewInit {
  public states = States;
  public state: BehaviorSubject<States> = new BehaviorSubject<States>(this.states.IDLE);
  public alive$: Subject<void> = new Subject();
  public componentMinHeight: string;
  public isConnected: boolean;
  public isFullscreen: boolean;
  public isControlPanelHidden: boolean;
  private manager: RemoteDesktopManager;
  private parameters = {
    'hostname': '192.168.1.33',
    'port': 3389,
    'ignore-cert': true,
    'dpi': 96,
    'width': window.screen.width,
    'height': window.screen.height,
    'image': 'image/png',
    'audio': 'audio/L16',
  };
  
  @Input() host: string;

  @ViewChild('container')
  private container: ElementRef;

  @HostListener('window:resize', ['$event'])
  private onWindowResize(event: any): void {
    this.calculateComponentHeight();
  }

  constructor(private element: ElementRef, 
              private clipboardManager: ClipboardManager,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    
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

  get connectionParams() {
    return JSON.stringify(this.parameters);
  }

  handleEnterFullScreen():void {
    this.manager.setFullScreen(true);
  }

  handleExitFullScreen():void {
    this.manager.setFullScreen(false);
  }

  handleHideControlPanel(e: MouseEvent):void {
    e.preventDefault();
    e.stopPropagation();
    this.isControlPanelHidden = !this.isControlPanelHidden;
  }

  handleConnect(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.connect();
  }

  handleTakeScreenshot(e: MouseEvent):void {
    e.preventDefault();
    e.stopPropagation();
    this.manager.createScreenshot(blob => {
      if (blob) {
        FileSaver.saveAs(blob, `screenshot.png`);
      }
    });
  }
  
  handleToggleFullscreen(e: MouseEvent):void {
    e.preventDefault();
    e.stopPropagation();
    this.manager.setFullScreen(!this.isFullscreen);
  }

  private connect(): void {
    
    if (!this.isConnected) {
      const tunnel = new WebSocketTunnel(this.host);
      this.manager = new RemoteDesktopManager(tunnel);
      this.manager.onReconnect.subscribe(reconnect => this.connect());

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
      
      this.manager.connect(this.parameters);
    } else {
      this.manager.disconnect();
      this.manager = null;
    }
  }

  private setState(newState: States): void {
    this.state.next(newState);
  }

  private handleState(newState: States) {
    switch (newState) {
      case RemoteDesktopManager.STATE.CONNECTED:
        this.setState(this.states.CONNECTED);
        this.isConnected = true;
        this.toastr.success('Connected');
        break;
      case RemoteDesktopManager.STATE.DISCONNECTED:
        this.exitFullScreen();
        this.setState(this.states.DISCONNECTED);
        this.isConnected = false;
        this.toastr.info('Disconnected');
        break;
      case RemoteDesktopManager.STATE.IDLE:
        this.setState(this.states.IDLE);
        break;
      case RemoteDesktopManager.STATE.CONNECTING:
      case RemoteDesktopManager.STATE.WAITING:
        this.setState(this.states.CONNECTING);
        break;
      case RemoteDesktopManager.STATE.CLIENT_ERROR:
      case RemoteDesktopManager.STATE.TUNNEL_ERROR:
        this.exitFullScreen();
        this.setState(this.states.ERROR);
        this.isConnected = false;
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
      this.isControlPanelHidden = true;
    }
  }

  private exitFullScreen(): void {
    if (!this.isFullscreen) return;
    if (screenfull.isEnabled) {
      screenfull.exit();
    }
  }

  private calculateComponentHeight():void {
    const componentWidth = this.element.nativeElement.offsetWidth;
    this.componentMinHeight = `${Math.ceil(componentWidth * (window.screen.height / window.screen.width))-2}px`;
  }

}

export enum States {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  IDLE = 'IDLE'
}