// services/aside.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface AsideContent {
  title: string;
  commands?: {
    action: string;
    keys: string;
    description: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AsideService {
  private contentSubject = new BehaviorSubject<AsideContent | null>(null);
  private isVisibleSubject = new BehaviorSubject<boolean>(true);

  private routeMap = new Map<string, AsideContent>([
    ['/orthographic', {
      title: 'Orthographic Controls',
      commands: [
        { action: 'Rotate Globe', keys: 'Mouse Drag', description: 'Click and drag to rotate the view' },
        { action: 'Zoom', keys: 'Alt + Mouse Drag', description: 'Hold Alt and drag to define zoom area' },
        { action: 'Reset View', keys: 'Double Click', description: 'Reset to default view' }
      ]
    }]
  ]);

  constructor(router: Router) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.contentSubject.next(this.routeMap.get(event.url) || null);
    });
  }

  getContent() { return this.contentSubject.asObservable(); }
  getVisibility() { return this.isVisibleSubject.asObservable(); }
  toggleVisibility() { this.isVisibleSubject.next(!this.isVisibleSubject.value); }
}