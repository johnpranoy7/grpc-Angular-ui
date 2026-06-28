import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="hero">
        <div class="hero-text">
          <p class="eyebrow">Spring Boot · gRPC · Angular</p>
          <h1>Students Enrollment Demo</h1>
          <p class="subtitle">Explore all four gRPC communication patterns through a modern UI backed by your BFF.</p>
        </div>
        <div class="hero-meta">
          <span class="meta-pill">BFF {{ apiUrl }}</span>
        </div>
      </header>

      <nav class="tabs">
        <a routerLink="/unary" routerLinkActive="active">Unary</a>
        <a routerLink="/server-stream" routerLinkActive="active">Server Stream</a>
        <a routerLink="/client-stream" routerLinkActive="active">Client Stream</a>
        <a routerLink="/bidi" routerLinkActive="active">Bidirectional</a>
      </nav>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      padding-bottom: 3rem;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      padding: 2.5rem 2rem 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .eyebrow {
      margin: 0 0 0.5rem;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #38bdf8;
      font-weight: 600;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      color: #f8fafc;
      line-height: 1.15;
    }

    .subtitle {
      margin: 0.75rem 0 0;
      max-width: 540px;
      color: #94a3b8;
      line-height: 1.5;
    }

    .meta-pill {
      display: inline-block;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: #bae6fd;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0 2rem 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .tabs a {
      padding: 0.55rem 1.1rem;
      text-decoration: none;
      color: #cbd5e1;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      background: rgba(30, 41, 59, 0.5);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .tabs a:hover {
      border-color: rgba(56, 189, 248, 0.4);
      color: #f8fafc;
    }

    .tabs a.active {
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      border-color: transparent;
      color: white;
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.35);
    }

    .content {
      padding: 0 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    @media (max-width: 720px) {
      .hero {
        flex-direction: column;
        padding: 1.5rem 1rem 1rem;
      }

      .tabs, .content {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class AppComponent {
  apiUrl = environment.apiUrl;
}
