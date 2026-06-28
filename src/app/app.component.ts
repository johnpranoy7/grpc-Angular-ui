import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
              <span>Spring Boot gRPC service · port 9090 · JPA + H2</span>
            </li>
            <li>
              <strong>grpc-client</strong>
              <span>BFF bridging HTTP/SSE/WebSocket → gRPC · port 8080</span>
            </li>
            <li>
              <strong>grpc-demo-ui</strong>
              <span>This Angular app · port 4200</span>
            </li>
          </ul>

          <h3>gRPC communication types</h3>
          <ul class="rpc-types">
            <li><strong>Unary</strong> — one request, one response</li>
            <li><strong>Server streaming</strong> — one request, many responses</li>
            <li><strong>Client streaming</strong> — many requests, one response</li>
            <li><strong>Bidirectional</strong> — many requests, many responses</li>
          </ul>
          <p class="sidebar-hint">
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
export class AppComponent {}
