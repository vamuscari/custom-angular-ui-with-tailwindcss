import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'custom-angular-ui-with-tailwindcss';
  options = ['option1', 'option2', 'option3'];
  objectOptions: Array<{ userName: string; id: string }> = [
    { userName: 'User 1', id: '1' },
    { userName: 'User 2', id: '2' },
    { userName: 'User 3', id: '3' },
  ];
}
