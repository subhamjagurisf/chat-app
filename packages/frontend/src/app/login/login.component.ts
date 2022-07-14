import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((res: any) => {
      if (res.get('accessToken') && res.get('accessToken') != '') {
        localStorage.setItem('@chat-app-accessToken', res.get('accessToken'));
        location.href = '/chat';
      }
    });
  }

  login() {
    location.href = `${environment.BASE_URL}/auth/google`;
  }
}
