import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs'; // 🌟 Subject थपियो

@Injectable({
  providedIn: 'root',
})
export class CartEventService {
  // 🌟 null बाट सुरु गर्ने ताकि पहिलो पटक पेज लोड हुँदा थाहा होस्
  private cartUpdateSubject = new BehaviorSubject<any>(null);
  cartUpdated$ = this.cartUpdateSubject.asObservable();

  // 🌟 Sidebar खोल्न/बन्द गर्नका लागि नयाँ Event Subject
  private toggleSidebarSubject = new Subject<boolean>();
  toggleSidebar$ = this.toggleSidebarSubject.asObservable();

  private orderUpdateSubject = new BehaviorSubject<any>(null);
  orderUpdated$ = this.orderUpdateSubject.asObservable();

  // 🌟 भ्यालु आउँदा पास गर्ने, नआउँदा ट्रु (true) मान्ने
  notifyCartUpdate(data: any = true) {
    this.cartUpdateSubject.next(data);
  }

  getCartItems(): any[] {
    const value = this.cartUpdateSubject.getValue();
    return Array.isArray(value) ? value : [];
  }

  // 🌟 १. Sidebar खोल्नका लागि method
  openCartSidebar() {
    this.toggleSidebarSubject.next(true);
  }

  // 🌟 २. Sidebar बन्द गर्नका लागि method
  closeCartSidebar() {
    this.toggleSidebarSubject.next(false);
  }

  notifyOrderID(Id: number) {
    this.orderUpdateSubject.next(Id);
  }
}
