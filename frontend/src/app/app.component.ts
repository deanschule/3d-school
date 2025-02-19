import {APP_INITIALIZER, Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {HelloListComponent} from "./hello-list/hello-list.component";
import {KeycloakAngularModule} from "keycloak-angular";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HelloListComponent, RouterOutlet, KeycloakAngularModule],
  providers: [ ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{

  constructor() {
    }



}
