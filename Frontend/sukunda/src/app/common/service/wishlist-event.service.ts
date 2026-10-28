import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistEventService {
  private static readonly STORAGE_KEY = 'sukunda_wishlist';
  private wishlistSubject = new BehaviorSubject<any[]>(this.loadFromStorage());
  wishlist$ = this.wishlistSubject.asObservable();

  private loadFromStorage(): any[] {
    try {
      const raw = localStorage.getItem(WishlistEventService.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(items: any[]) {
    localStorage.setItem(WishlistEventService.STORAGE_KEY, JSON.stringify(items));
    this.wishlistSubject.next(items);
  }

  getCount(): number {
    return this.wishlistSubject.getValue().length;
  }

  toggle(product: any): boolean {
    const items = this.wishlistSubject.getValue();
    const idx = items.findIndex((i: any) => i.productId === product.productId);
    if (idx >= 0) {
      items.splice(idx, 1);
      this.save(items);
      return false; // removed
    } else {
      items.push(product);
      this.save(items);
      return true; // added
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.getValue().some((i: any) => i.productId === productId);
  }

  add(product: any) {
    if (!this.isInWishlist(product.productId)) {
      const items = [...this.wishlistSubject.getValue(), product];
      this.save(items);
    }
  }

  remove(productId: number) {
    const items = this.wishlistSubject.getValue().filter((i: any) => (i.productId ?? i.id) !== productId);
    this.save(items);
  }

  clear() {
    this.save([]);
  }
}
