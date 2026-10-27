import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root: the login and public pages render alone; portal pages render inside PortalShellComponent. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  title = 'organs-donations-app';
}
