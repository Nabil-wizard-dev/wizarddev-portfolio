import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

declare const FrenifyDeebo: { init: () => void } | undefined;

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'wizarddevPortfolio';

  ngAfterViewInit(): void {
    // The template's jQuery script runs on document ready, before Angular
    // has rendered this component's content, so it never finds any of its
    // elements. Re-run it once the view is actually in the DOM.
    setTimeout(() => {
      if (typeof FrenifyDeebo !== 'undefined') {
        FrenifyDeebo.init();
      }
    });
  }
}
