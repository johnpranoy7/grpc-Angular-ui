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
            <a class="back-link mb-2" href="https://johnpranoy7.dev/projects/grpc-microservices/" target="_blank" rel="noopener noreferrer">
              <i class="bi bi-arrow-left"></i> Back to project info
            </a>
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
          <a class="all-projects-link" href="https://johnpranoy7.dev/projects/" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-grid-1x2"></i> All projects
          </a>
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
          <details class="grpc-primer" open>
            <summary>
              <span class="primer-title">
                <i class="bi bi-info-circle"></i> What is gRPC and its 4 communication patterns
              </span>
              <i class="bi bi-chevron-down chevron"></i>
            </summary>
            <div class="grpc-primer-body">
              <p class="primer-lead">
                <strong>gRPC</strong> is a high-performance, open-source RPC framework from Google.
                It runs over <strong>HTTP/2</strong> and uses <strong>Protocol Buffers</strong> — a
                compact, strongly-typed binary format — so services call each other like local functions.
              </p>

              <div class="why-grpc">
                <span class="why-title">Why look at it after HTTP/1 REST?</span>
                <ul>
                  <li>HTTP/2 multiplexing and binary framing → lower latency and overhead than JSON over HTTP/1</li>
                  <li>Strongly-typed Protobuf contracts instead of hand-written JSON DTOs</li>
                  <li>Streaming is first-class in the protocol, not bolted on</li>
                </ul>
              </div>

              <svg class="svg-defs" aria-hidden="true" focusable="false">
                <defs>
                  <marker id="ah-req" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L6,3 L0,6 Z" fill="var(--app-accent)"></path>
                  </marker>
                  <marker id="ah-res" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L6,3 L0,6 Z" fill="var(--app-success)"></path>
                  </marker>
                </defs>
              </svg>

              <div class="pattern-grid">
                <div class="pattern-card">
                  <div class="pattern-head">
                    <span class="pattern-name">Unary</span>
                    <span class="pattern-sub">1 request · 1 response</span>
                  </div>
                  <svg viewBox="0 0 200 100" class="pattern-svg" role="img" aria-label="Unary: one request, one response">
                    <rect class="node" x="4" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="28" y="53">Client</text>
                    <rect class="node" x="148" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="172" y="53">Server</text>
                    <line class="req" x1="54" y1="44" x2="144" y2="44" marker-end="url(#ah-req)"></line>
                    <line class="res" x1="146" y1="58" x2="56" y2="58" marker-end="url(#ah-res)"></line>
                  </svg>
                </div>

                <div class="pattern-card">
                  <div class="pattern-head">
                    <span class="pattern-name">Server streaming</span>
                    <span class="pattern-sub">1 request · many responses</span>
                  </div>
                  <svg viewBox="0 0 200 100" class="pattern-svg" role="img" aria-label="Server streaming: one request, many responses">
                    <rect class="node" x="4" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="28" y="53">Client</text>
                    <rect class="node" x="148" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="172" y="53">Server</text>
                    <line class="req" x1="54" y1="40" x2="144" y2="40" marker-end="url(#ah-req)"></line>
                    <line class="res" x1="146" y1="52" x2="56" y2="52" marker-end="url(#ah-res)"></line>
                    <line class="res" x1="146" y1="61" x2="56" y2="61" marker-end="url(#ah-res)"></line>
                    <line class="res" x1="146" y1="70" x2="56" y2="70" marker-end="url(#ah-res)"></line>
                  </svg>
                </div>

                <div class="pattern-card">
                  <div class="pattern-head">
                    <span class="pattern-name">Client streaming</span>
                    <span class="pattern-sub">many requests · 1 response</span>
                  </div>
                  <svg viewBox="0 0 200 100" class="pattern-svg" role="img" aria-label="Client streaming: many requests, one response">
                    <rect class="node" x="4" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="28" y="53">Client</text>
                    <rect class="node" x="148" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="172" y="53">Server</text>
                    <line class="req" x1="54" y1="40" x2="144" y2="40" marker-end="url(#ah-req)"></line>
                    <line class="req" x1="54" y1="49" x2="144" y2="49" marker-end="url(#ah-req)"></line>
                    <line class="req" x1="54" y1="58" x2="144" y2="58" marker-end="url(#ah-req)"></line>
                    <line class="res" x1="146" y1="70" x2="56" y2="70" marker-end="url(#ah-res)"></line>
                  </svg>
                </div>

                <div class="pattern-card">
                  <div class="pattern-head">
                    <span class="pattern-name">Bidirectional</span>
                    <span class="pattern-sub">many ↔ many</span>
                  </div>
                  <svg viewBox="0 0 200 100" class="pattern-svg" role="img" aria-label="Bidirectional streaming: many requests and many responses">
                    <rect class="node" x="4" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="28" y="53">Client</text>
                    <rect class="node" x="148" y="26" width="48" height="48" rx="6"></rect>
                    <text class="node-label" x="172" y="53">Server</text>
                    <line class="req" x1="54" y1="42" x2="144" y2="42" marker-end="url(#ah-req)"></line>
                    <line class="res" x1="146" y1="52" x2="56" y2="52" marker-end="url(#ah-res)"></line>
                    <line class="req" x1="54" y1="62" x2="144" y2="62" marker-end="url(#ah-req)"></line>
                    <line class="res" x1="146" y1="72" x2="56" y2="72" marker-end="url(#ah-res)"></line>
                  </svg>
                </div>
              </div>

              <a class="primer-more" href="https://johnpranoy7.dev/projects/grpc-microservices/" target="_blank" rel="noopener noreferrer">
                Read the deeper gRPC vs REST breakdown <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </details>

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
