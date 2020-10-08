import { Component } from '@angular/core';
import { RemoteDesktopManager } from '@shared/services/remote-desktop-manager.service';
import { WebSocketTunnel } from 'guacamole-common-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public manager: RemoteDesktopManager;

  constructor() {
    const tunnel = new WebSocketTunnel("ws://localhost:8080/ws");
    this.manager = new RemoteDesktopManager(tunnel);
    this.handleConnect();
    this.manager.onReconnect.subscribe(reconnect => this.handleConnect());
  }

  handleConnect() {
    const parameters = {
      'hostname': '192.168.1.33',
      'port': 3389,
      'ignore-cert': true,
      'dpi': 96,
      'width': window.screen.width,
      'height': window.screen.height,
      'image': 'image/png',
      'audio': 'audio/L16',
    };
    this.manager.connect(parameters);
  }
}
