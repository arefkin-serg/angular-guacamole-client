import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RemoteDesktopComponent } from './component/remote-desktop/remote-desktop.component';
import { RemoteDesktopDisplayComponent } from './component/remote-desktop-display/remote-desktop-display.component';

@NgModule({
  exports: [
    RemoteDesktopComponent,
  ],
  imports: [
    CommonModule,
  ],
  declarations: [
    RemoteDesktopComponent,
    RemoteDesktopDisplayComponent,]
})
export class SharedModule {
  
}
