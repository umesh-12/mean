# Sukunda Metal → Angular 19 Conversion Plan

**Architecture:** DivinePet Angular 19 (routing, guards, services, SCSS 7-1, admin panel)  
**UI Layer:** Sukunda Metal 25 HTML pages → Angular components (exact markup, styles, interactions)  
**File Structure:** DivinePet patterns (`src/app/{admin,user-admin,pages,components,shared-services,header,footer}`)  
**Styling:** Sukunda CSS → SCSS partials (variables, components, layout, pages) with DivinePet organization  
**Logic:** Sukunda `script_7_main.js` → Angular services (Cart, Wishlist, Product, Category) + DivinePet services (Auth, Order, Payment, Guards)  
**New Components:** Created as needed following DivinePet patterns (component + service + model + routes)

---

## 1. Project Overview

| Aspect | Decision |
|--------|----------|
| **Framework** | Angular 19 (standalone components, signals, new control flow) |
| **Styling** | SCSS (7-1 pattern) matching DivinePet structure |
| **UI Source** | Sukunda Metal 25 HTML pages (exact markup preserved) |
| **Architecture Source** | DivinePet Angular (routing, guards, services, admin) |
| **State Management** | RxJS BehaviorSubject services (Cart, Wishlist) + localStorage sync |
| **Build Tool** | Angular CLI (esbuild/Vite) |
| **Package Manager** | npm (match DivinePet lockfile versions) |

---

## 2. Route Mapping (25 HTML Pages → Angular Routes)

### Public Routes (No Guard)
| HTML File | Route | Component | Lazy |
|-----------|-------|-----------|------|
| `index.html` | `/` | `HomeComponent` | No |
| `index.html` | `/home` | `HomeComponent` | No |
| `about.html` | `/about` | `AboutComponent` | Yes |
| `contact.html` | `/contact` | `ContactComponent` | Yes |
| `faq.html` | `/faq` | `FaqComponent` | Yes |
| `terms-condition.html` | `/terms` | `TermsComponent` | Yes |
| `privacy-policy.html` | `/privacy` | `PrivacyComponent` | Yes |
| `error.html` | `/error` | `ErrorComponent` | No |
| `comming-soon.html` | `/coming-soon` | `ComingSoonComponent` | Yes |
| `blog-v5.html` | `/blog` | `BlogListComponent` | Yes |
| `blog-details.html` | `/blog/:slug` | `BlogDetailComponent` | Yes |

### Shop Routes (Lazy Module)
| HTML File | Route | Component | Notes |
|-----------|-------|-----------|-------|
| `shop.html` | `/shop` | `ShopComponent` | Main grid + filters |
| `shop-v4.html` | `/shop/banner` | `ShopComponent` | Variant via input |
| `shop-layouts.html` | `/shop/layout/:type` | `ShopComponent` | Layout variants |
| `categories.html` | `/categories` | `ShopCategoriesComponent` | |
| `product-details.html` | `/product/:id` | `ProductDetailComponent` | Default variant |
| `product-details-v4.html` | `/product/:id/v4` | `ProductDetailComponent` | Horizontal thumbs |
| `product-details-v6.html` | `/product/:id/v6` | `ProductDetailComponent` | Sticky details |

### Cart & Checkout (Customer Guard)
| HTML File | Route | Component |
|-----------|-------|-----------|
| `cart.html` | `/cart` | `CartComponent` |
| `checkout.html` | `/checkout` | `CheckoutComponent` |
| `wishlist.html` | `/wishlist` | `WishlistComponent` |

### Auth Routes (No Guard)
| HTML File | Route | Component |
|-----------|-------|-----------|
| `login.html` | `/login` | `LoginComponent` |
| `register.html` | `/register` | `RegisterComponent` |
| `password-reset.html` | `/password-reset` | `PasswordResetComponent` |

### Customer Protected Routes (customerAuthGuard)
| HTML File | Route | Component |
|-----------|-------|-----------|
| `order-tracking.html` | `/order-tracking` | `OrderTrackingComponent` |
| `order-state.html` | `/order-state` | `OrderStateComponent` |
| (new) | `/account` | `AccountComponent` |
| (new) | `/profile` | `ProfileComponent` |
| (new) | `/orders` | `CustomerOrdersComponent` |

### Admin Routes (adminAuthGuard) — Full DivinePet Reuse
All DivinePet admin routes preserved under `/admin/*` with Sukunda product data model.

---

## 3. Component Architecture

### Layout Components (New - Sukunda UI)
```
src/app/
├── header/
│   ├── header.component.ts
│   ├── header.component.html      # Sukunda header markup
│   ├── header.component.scss      # Sukunda header styles
│   ├── header.model.ts
│   ├── header.service.ts
│   └── header.routes.ts
├── footer/
│   ├── footer.component.ts
│   ├── footer.component.html      # Sukunda footer markup
│   ├── footer.component.scss
│   └── footer.service.ts
├── layouts/
│   ├── public-layout/
│   │   ├── public-layout.component.ts
│   │   ├── public-layout.component.html  # <app-header> + <router-outlet> + <app-footer>
│   │   └── public-layout.component.scss
│   └── customer-layout/
│       ├── customer-layout.component.ts
│       ├── customer-layout.component.html
│       └── customer-layout.component.scss
```

### Page Components (Sukunda HTML → Angular)
```
src/app/pages/
├── home/
│   ├── home.component.ts
│   ├── home.component.html      # index.html content
│   ├── home.component.scss
│   ├── home.model.ts
│   ├── home.service.ts
│   └── home.routes.ts
├── about/
├── contact/
├── faq/
├── terms/
├── privacy/
├── error/
├── coming-soon/
├── blog/
│   ├── blog-list/
│   │   ├── blog-list.component.ts
│   │   ├── blog-list.component.html   # blog-v5.html
│   │   └── blog-list.component.scss
│   └── blog-detail/
│       ├── blog-detail.component.ts
│       ├── blog-detail.component.html # blog-details.html
│       └── blog-detail.component.scss
└── shop/
    ├── shop/
    │   ├── shop.component.ts
    │   ├── shop.component.html        # shop.html + shop-v4.html + shop-layouts.html merged
    │   ├── shop.component.scss
    │   ├── shop.model.ts
    │   ├── shop.service.ts
    │   └── shop.routes.ts
    ├── categories/
    │   ├── shop-categories.component.ts
    │   ├── shop-categories.component.html  # categories.html
    │   └── shop-categories.component.scss
    ├── product-detail/
    │   ├── product-detail.component.ts
    │   ├── product-detail.component.html   # product-details.html + v4 + v6 merged
    │   ├── product-detail.component.scss
    │   ├── product-detail.model.ts
    │   └── product-detail.service.ts
    ├── cart/
    │   ├── cart.component.ts
    │   ├── cart.component.html        # cart.html
    │   ├── cart.component.scss
    │   └── cart.service.ts (shared)
    ├── checkout/
    │   ├── checkout.component.ts
    │   ├── checkout.component.html    # checkout.html
    │   ├── checkout.component.scss
    │   ├── checkout.model.ts
    │   └── checkout.service.ts
    └── wishlist/
        ├── wishlist.component.ts
        ├── wishlist.component.html    # wishlist.html
        └── wishlist.component.scss
```

### Auth Components (Sukunda UI + DivinePet AuthService)
```
src/app/auth/
├── login/
│   ├── login.component.ts
│   ├── login.component.html      # login.html
│   ├── login.component.scss
│   ├── login.model.ts
│   └── login.service.ts
├── register/
│   ├── register.component.ts
│   ├── register.component.html   # register.html
│   ├── register.component.scss
│   ├── register.model.ts
│   └── register.service.ts
└── password-reset/
    ├── password-reset.component.ts
    ├── password-reset.component.html  # password-reset.html
    ├── password-reset.component.scss
    └── password-reset.service.ts
```

### Customer Portal (Sukunda UI + DivinePet Pattern)
```
src/app/customer/
├── layouts/
│   └── customer-layout/
├── account/
│   ├── account.component.ts
│   ├── account.component.html
│   └── account.component.scss
├── orders/
│   ├── customer-orders.component.ts
│   ├── customer-orders.component.html
│   └── customer-orders.component.scss
├── order-tracking/
│   ├── order-tracking.component.ts
│   ├── order-tracking.component.html  # order-tracking.html
│   └── order-tracking.component.scss
├── order-state/
│   ├── order-state.component.ts
│   ├── order-state.component.html     # order-state.html
│   └── order-state.component.scss
├── profile/
│   ├── profile.component.ts
│   ├── profile.component.html
│   └── profile.component.scss
└── wishlist/ (reuse shop/wishlist)
```

### Shared Components (Sukunda UI → Reusable)
```
src/app/components/
├── cart-sidebar/           # From script_7_main.js drawer
│   ├── cart-sidebar.component.ts
│   ├── cart-sidebar.component.html
│   └── cart-sidebar.component.scss
├── quick-view/             # From script_7_main.js modal
│   ├── quick-view.component.ts
│   ├── quick-view.component.html
│   └── quick-view.component.scss
├── product-gallery/        # From script_7_main.js lightgallery
│   ├── product-gallery.component.ts
│   ├── product-gallery.component.html
│   └── product-gallery.component.scss
├── product-card/           # .cs_product_style_1/2
│   ├── product-card.component.ts
│   ├── product-card.component.html
│   └── product-card.component.scss
├── quantity-stepper/       # Reusable quantity input
├── toast/                  # Wrapper for ngx-toastr
└── loader/                 # DivinePet loader service
```

---

## 4. Service Layer

### New Services (Sukunda Logic → Angular)
```
src/app/shared-services/
├── cart.service.ts              # Port of script_7_main.js cart drawer + localStorage
├── wishlist.service.ts          # Port of script_7_main.js wishlist + localStorage
├── product.service.ts           # Product API + filters
├── category.service.ts          # Category tree + filters
├── coupon.service.ts            # Cart coupons
└── toast.service.ts             # Wrapper for ngx-toastr
```

### Reused DivinePet Services (Zero Changes)
- `auth.service.ts` — login, register, JWT, refresh, roles
- `auth.guard.ts` — `adminAuthGuard`, `customerAuthGuard`
- `http.interceptor.ts` — auth header, error handling, loading
- `order.service.ts` — customer orders, tracking, history
- `address.service.ts` — checkout addresses
- `payment.service.ts` — COD/online payment flow
- `loader.service.ts` — global loading state
- `meta.service.ts` — SEO meta tags per route

---

## 5. SCSS Architecture (DivinePet 7-1 + Sukunda Theme)

```
src/admin-sass/sass/
├── abstracts/
│   ├── _variables.scss       # DivinePet + Sukunda gold theme
│   ├── _mixins.scss          # Reuse DivinePet
│   └── _functions.scss       # Reuse DivinePet
├── base/
│   ├── _reset.scss
│   ├── _typography.scss      # Playfair Display + Inter
│   └── _global.scss
├── components/
│   ├── _button.scss          # .cs_btn_style_1, .cs_btn_style_2, etc.
│   ├── _form.scss            # Sukunda form controls
│   ├── _card.scss            # .cs_product_style_1, .cs_product_style_2
│   ├── _badge.scss           # New, Sale, Hot badges
│   ├── _modal.scss           # Quick view, cart drawer
│   ├── _toast.scss           # ngx-toastr theme
│   ├── _accordion.scss
│   ├── _table.scss
│   └── _input.scss
├── layout/
│   ├── _header.scss          # Sticky header, nav, actions
│   ├── _footer.scss          # Widgets, social, newsletter
│   ├── _sidebar.scss         # Shop filter sidebar
│   └── _layout.scss          # Container, grid, spacing
├── pages/
│   ├── _home.scss            # Hero, banners, featured
│   ├── _shop.scss            # Grid, toolbar, pagination, filters
│   ├── _product-detail.scss  # Gallery, variants, tabs, reviews
│   ├── _cart.scss            # Table, totals, coupons
│   ├── _checkout.scss        # Form steps, payment methods
│   ├── _auth.scss            # Login, register, password reset
│   ├── _blog.scss
│   └── _admin.scss           # Reuse DivinePet
├── _custom.scss              # Sukunda overrides (logo, colors)
└── main.scss                 # Entry: @use all partials
```

### Key Variables (Sukunda Theme)
```scss
// _variables.scss
$primary-color:       #2C2C2C;        // DivinePet charcoal
$accent-color:        #D1B577;        // Sukunda exact logo gold
$accent-dark:         #B0985E;        // Sukunda mid gold (replaces #b8962e)
$accent-light:        #E6D398;        // Sukunda light gold
$white-color:         #FFFFFF;
$gray-100:            #F0E3D8;        // Sukunda warm gray
$font-primary:        'Playfair Display', serif;
$font-secondary:      'Inter', sans-serif;
$border-radius:       8px;
$transition-base:     0.3s ease;
$container-max:       1320px;
$header-height:       130px;          // Increased for 110px logo
```

---

## 6. JavaScript Logic Migration (script_7_main.js → Angular)

| Sukunda Feature | Angular Implementation |
|-----------------|------------------------|
| Cart Drawer | `CartService` + `CartSidebarComponent` (ng-bootstrap offcanvas) |
| Wishlist | `WishlistService` + header badge (reactive) |
| Quick View Modal | `QuickViewComponent` + `NgbModal` |
| Product Gallery | `ProductGalleryComponent` + `lightgallery/angular` |
| Swiper Sliders | `swiper/angular` (hero, thumbs, testimonials) |
| NiceSelect | Native `<select>` + SCSS or `ng-select` |
| Odometer Counters | `CounterDirective` + `IntersectionObserver` |
| Countdown Timers | `CountdownComponent` + RxJS `interval` |
| Price Range Slider | `ngx-slider` or HTML5 range |
| Quantity Steppers | `QuantityInputComponent` (standalone) |
| Toast Notifications | `ToastService` → `ngx-toastr` |
| Form Validation | Reactive Forms + custom validators |
| Lazy Loading | `NgOptimizedImage` directive |

---

## 7. Asset Migration

| Source | Destination |
|--------|-------------|
| `assets/images/*.png/jpg` (products) | `src/assets/images/products/` |
| `assets/images/img_*_category*.jpg` | `src/assets/images/categories/` |
| `assets/images/img_*_hero*.jpg` | `src/assets/images/banners/` |
| `img_1_logo.png`, `icon_65_favicon.png` | `src/assets/images/brand/` |
| Remixicon (CDN) | `remixicon` npm + `fontawesome-free` (already in deps) |
| Google Fonts | `angular.json` styles array |

---

## 8. Admin Panel (Full DivinePet Reuse)

**Zero UI changes** - DivinePet admin handles:
- Product CRUD (extend model: metal_type, purity, weight)
- Category management
- Order management (matches Sukunda order tracking)
- Brand/Unit/Fiscal Year
- Dashboard analytics

---

## 9. Implementation Phases

| Phase | Tasks | Est. Days |
|-------|-------|-----------|
| **1. Foundation** | Angular 19 init, deps, SCSS 7-1, routing skeleton, env config | 2 |
| **2. Theme & Layout** | Header, Footer, PublicLayout, SCSS variables, global styles | 3 |
| **3. Core Services** | CartService, WishlistService, ProductService (reactive, localStorage) | 3 |
| **4. Public Pages** | Home, About, Contact, FAQ, Blog, Error, ComingSoon | 3 |
| **5. Shop Module** | Shop (grid/filters), Categories, ProductDetail (3→1), Cart, Checkout, Wishlist | 5 |
| **6. Auth Module** | Login, Register, PasswordReset + guards | 2 |
| **7. Customer Portal** | Account, Orders, Profile, OrderTracking | 2 |
| **8. Admin Panel** | Configure DivinePet admin for Sukunda products | 1 |
| **9. Polish** | Responsive, animations, SEO, image optimization, testing | 3 |
| **Total** | **Production-ready Angular 19 e-commerce** | **~24 days** |

---

## 10. Coding Standards (DivinePet Patterns)

### Component Pattern
```typescript
// Standalone component with signals
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, QuantityInputComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product = input.required<Product>();
  @Output() addToCart = output<Product>();
  
  protected readonly cartService = inject(CartService);
  protected readonly wishlistService = inject(WishlistService);
}
```

### Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((sum, i) => sum + i.price * i.qty, 0));
  readonly count = computed(() => this._items().length);
  
  constructor() { this.loadFromStorage(); }
  
  add(item: Product, qty = 1) { ... }
  remove(productId: string) { ... }
  updateQty(productId: string, qty: number) { ... }
  private syncStorage() { ... }
}
```

### Route Guard Pattern
```typescript
export const customerAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() && auth.hasRole('customer') 
    ? true 
    : router.parseUrl('/login');
};
```

---

## 11. Definition of Done

- [ ] All 25 Sukunda pages functional as Angular routes
- [ ] Cart/Wishlist persist across sessions (localStorage + reactive UI)
- [ ] Product detail handles all 3 variants (gallery, sticky, thumbnails)
- [ ] Checkout flow: cart → address → payment → confirmation
- [ ] Auth: login/register/password-reset with guards
- [ ] Admin: full product/category/order management
- [ ] Responsive: mobile/tablet/desktop match Sukunda breakpoints
- [ ] Theme: Sukunda gold colors, typography, spacing exact
- [ ] Build: `ng build --configuration production` < 500KB initial JS
- [ ] Lint: `ng lint` passes
- [ ] Tests: Unit tests for CartService, WishlistService, ProductService

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| CSS conflicts | SCSS namespacing, component-scoped styles, `.cs_` prefix kept |
| JS logic gaps | Unit tests for Cart/Wishlist against original JS behavior |
| Responsive breakpoints | Map Sukunda media queries to SCSS mixins exactly |
| Performance | Lazy-load all feature routes; `NgOptimizedImage` for products |
| SEO | Meta/Title service per route; Angular Universal ready |

---

## 13. Next Steps

1. **Phase 1** - Foundation & Theme Setup (2 days)
2. **Phase 2** - Layout Components (3 days)
3. **Phase 3** - Core Services (3 days)
4. **Phase 4** - Public Pages (3 days)
5. **Phase 5** - Shop Module (5 days)
6. **Phase 6** - Auth Module (2 days)
7. **Phase 7** - Customer Portal (2 days)
8. **Phase 8** - Admin Config (1 day)
9. **Phase 9** - Polish & Deploy (3 days)

---

## 0. Project Setup & Safety Protocol (Execute First)

### 0.1 Copy DivinePet → Sukunda Metal (Requires Your Approval)
```bash
# ONLY RUN AFTER YOUR EXPLICIT "GO"
cp -r "D:\Projects\DivinePet\DivinePet-Angular" "D:\Projects\Sukunda Metal\SukundaMetal-Angular"
```

### 0.2 Safety Guarantees (Enforced at Tool Level)

| Safeguard | Implementation |
|-----------|----------------|
| **Path Isolation** | All tool calls use absolute paths: `D:\Projects\Sukunda Metal\SukundaMetal-Angular\*` |
| **Original Protection** | Zero operations on `D:\Projects\DivinePet\DivinePet-Angular\*` |
| **Audit Trail** | Every tool call logs full absolute path in output |
| **Git Verification** | `git status` in original always shows clean |

### 0.3 Pre-Flight Verification (Run Before Phase 1)
```bash
# 1. Verify copy exists
ls -la "D:\Projects\Sukunda Metal\SukundaMetal-Angular\package.json"

# 2. Verify original untouched
cd "D:\Projects\DivinePet\DivinePet-Angular" && git status
# Expected: "nothing to commit, working tree clean"

# 3. Initialize copy's git (recommended)
cd "D:\Projects\Sukunda Metal\SukundaMetal-Angular"
git init && git add -A && git commit -m "Phase 0: DivinePet baseline copy"
```

### 0.4 Post-Copy Configuration (Before Phase 1)
Update these files in the **copy only**:
- `package.json` → `"name": "sukunda-metal"`
- `angular.json` → project name, output paths
- `src/environments/environment*.ts` → Sukunda API endpoints
- `tsconfig.json` → paths if needed

---

**Status:** Analysis Complete | **Ready for Phase 1 on Green Light**