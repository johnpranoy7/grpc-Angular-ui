import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DemoApiService } from './services/demo-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="top-bar">
        <div class="container d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <p class="app-eyebrow mb-1">Student enrollment domain · Spring Boot · Angular</p>
            <h1 class="top-title mb-0">gRPC Communication Patterns Demo</h1>
          </div>
          <div class="dev-info">
            <span class="dev-info-label">Developer</span>
            <div class="dev-links">
              <a href="https://github.com/johnpranoy7" target="_blank" rel="noopener noreferrer" title="GitHub profile">
                <i class="bi bi-github"></i> GitHub
              </a>
              <a href="mailto:johnpranoy7@gmail.com" title="Email">
                <i class="bi bi-envelope"></i> Email
              </a>
              <a href="https://www.linkedin.com/in/johnpranoy7/" target="_blank" rel="noopener noreferrer" title="LinkedIn profile">
                <i class="bi bi-linkedin"></i> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </header>

      <div class="container workspace">
        <aside class="project-sidebar">
          <h2>About this project</h2>
          <p>
            A hands-on demo built to understand <strong>gRPC</strong> and its four
            communication patterns, using a student enrollment domain.
          </p>

          <h3>Architecture</h3>
          <ul class="app-stack">
            <li>
              <strong>grpc-server</strong>
              <span>Spring Boot gRPC service · JPA + H2</span>
            </li>
            <li>
              <strong>grpc-client</strong>
              <span>BFF bridging HTTP/SSE/WebSocket → gRPC</span>
            </li>
            <li>
              <strong>grpc-demo-ui</strong>
              <span>This Angular app</span>
            </li>
          </ul>

          <h3>gRPC communication types</h3>
          <ul class="rpc-types">
            <li><strong>Unary</strong> — one request, one response</li>
            <li><strong>Server streaming</strong> — one request, many responses</li>
            <li><strong>Client streaming</strong> — many requests, one response</li>
            <li><strong>Bidirectional</strong> — many requests, many responses</li>
          </ul>

          <h3>Demo maintenance</h3>
          <p class="sidebar-hint mb-2">
            UI enrollments fill course seats over time. Reset removes demo-added rows
            and keeps seed data. Auto-reset runs every 30 minutes on the server.
          </p>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm w-100"
            (click)="resetDemoData()"
            [disabled]="resetting">
            @if (resetting) {
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
            } @else {
              <i class="bi bi-arrow-counterclockwise me-1"></i>
            }
            Reset demo enrollments
          </button>
          @if (resetMessage) {
            <p class="reset-feedback" [class.text-success]="resetSuccess" [class.text-danger]="!resetSuccess">
              {{ resetMessage }}
            </p>
          }

          <p class="sidebar-hint mt-3 mb-0">
            Select a tab to try each pattern live against the running backend.
          </p>
        </aside>

        <section class="demo-workspace">
          <ul class="folder-tabs nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/unary" routerLinkActive="active">Unary</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/server-stream" routerLinkActive="active">Server stream</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/client-stream" routerLinkActive="active">Client stream</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bidi" routerLinkActive="active">Bidirectional</a>
            </li>
          </ul>

          <div class="tab-content-shell">
            <router-outlet />
          </div>
        </section>
      </div>

      <footer class="app-footer">
        <div class="container">
          Built by
          <a href="https://github.com/johnpranoy7" target="_blank" rel="noopener noreferrer">John Pranoy Yalla</a>
          · Spring Boot gRPC · BFF · Angular + Bootstrap 5
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  resetting = false;
  resetMessage: string | null = null;
  resetSuccess = false;

  constructor(private readonly api: DemoApiService) {}

  resetDemoData(): void {
    this.resetting = true;
    this.resetMessage = null;

    this.api.resetDemoEnrollments().subscribe({
      next: result => {
        this.resetSuccess = true;
        this.resetMessage = result.message;
        this.resetting = false;
      },
      error: err => {
        this.resetSuccess = false;
        this.resetMessage = err?.error?.message ?? err.message ?? 'Reset failed';
        this.resetting = false;
      }
    });
  }
}
