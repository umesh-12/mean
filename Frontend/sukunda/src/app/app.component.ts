import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Dead imports (not registered in `imports`; pages register their own header/footer):
// import { HeaderComponent } from './header/header.component';
// import { FooterComponent } from './footer/footer.component';
// import { LoaderComponent } from './loader-service/loader.component';
// import { AiChatbotComponent } from './components/ai-chatbot/ai-chatbot.component';
import { OneSignal } from 'onesignal-ngx';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'my-ng19-app';

  private os = inject(OneSignal);

  ngOnInit(): void {
    // OneSignal initialization
    this.os.init({
      appId: 'YOUR_ONESIGNAL_APP_ID', // OneSignal Dashboard bata payeko App ID
      safari_web_id: 'YOUR_SAFARI_WEB_ID', // (Optional)
      notifyButton: {
        enable: true, // Native bell prompt button offer garna
      } as any,
      allowLocalhostAsSecureOrigin: true, // Development environment (localhost) ko lagi
    });
  }
}
