import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public host:string;

  constructor() {
    this.host = "ws://localhost:8080/ws";
  }
}
