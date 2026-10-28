# Sukunda Metal API — Complete Reference + Integration Plan

====================================================================
ARCHITECTURE
====================================================================

Backend: .NET 8 Web API (Dapper + SQL Server)
  - Auth service:     port 5100  (JWT authentication)
  - Inventory service: port 5000  (all business logic)

Angular project: D:\Projects\Sukunda Metal\SukundaMetal-Angular
  - Already has: environment.apiBaseUrl → Auth (localhost:7140)
  - Already has: environment.apiBaseUrlForProduct → Inventory (localhost:7064)
  - NOTE: Ports 7140/7064 are the CURRENT Angular config.
    The .NET API runs on 5100/5000 by default. Confirm actual ports.

Response wrapper (all endpoints):
  { "success": bool, "message": string, "data": T, "errors": string[] }

====================================================================
EXISTING ANGULAR INFRASTRUCTURE (already in place, DO NOT recreate)
====================================================================

environment.ts:
  apiBaseUrl: 'https://localhost:7140'          ← Auth API
  apiBaseUrlForProduct: 'https://localhost:7064' ← Inventory API

Common services:
  common/service/shop-common.service.ts   ← main shop HTTP service
  common/service/product-review-service.ts ← review HTTP service
  common/service/cart-event.service.ts     ← cart change notification
  common/service/wishlist-event.service.ts ← wishlist change notification
  shared-services/authService/auth.service.ts ← JWT token + userId mgmt

Endpoints:
  common/end-point/shop-Urls.ts         ← all inventory endpoints
  common/end-point/product-review-Urls.ts ← review endpoints

Models:
  common/models/checkout-model.ts ← CheckoutPayloadModel
  common/models/product-review.models.ts

Auth guards:
  shared-services/Authguard/auth.guard.ts → adminAuthGuard, customerAuthGuard

Route:
  app.routes.ts: path '' → HomeComponent, 'shop' → ShopCategoriesComponent,
    'shop/shop-single/:id' → ShopSingleComponent (lazy loaded)

====================================================================
API ENDPOINTS (from D:\Projects\Sukunda Metal\SukundaMetal)
====================================================================

--- SHOP (browse) ---

GET  /api/product/getecommerceproducts  [AllowAnonymous]
  Query params: ?brandId=&categoryId=&productTypeId=&petTypeId=
  Returns: ApiResponse<List<EcommerceProductDto>>
  Fields per item:
    ProductId, ProductCode, ProductName, ShortName,
    ProductImage, Description, SKU,
    AvailableQty, SalesPrice, ComparePrice,
    CategoryId, CategoryName, BrandId, BrandName,
    CompanyName, ProductTypeName,
    ProductVariantId, Size, Color,
    ProductBatchId,
    TotalReviewCount, AvgRating,
    IsActive, IsBatchWise, IsPriceLocked

GET  /api/product/getecommerceproductdetails?id={productId}&branchId={branchId}
  [AllowAnonymous]
  Returns: ApiResponse<EcommerceProductDetailsDto>
  Same fields as listing PLUS:
    InStock, DiscountPercent,
    HasVariant, HasBatch,
    ProductVariants[] → { ProductVariantId, Size, Color, SKU, SalesPrice, MRP, IsActive }
    ProductBatchs[]   → { ProductBatchId, BatchNumber, Quantity }

GET  /api/category/getall  [Authorize]
  Returns: ApiResponse<List<CategoryDto>>
  Fields: Id, CategoryName, Description, CategoryImage, DisplayOrder, ParentCategoryId, IsActive

--- REVIEWS ---

GET  /api/productreview/getbyproduct?productId={int}  [AllowAnonymous]
  Returns: ApiResponse<List<ProductReviewDto>>
  Fields: ReviewId, ProductId, CustomerId, Rating (1-5), ReviewTitle, ReviewText, ReviewDate, IsActive

GET  /api/productreview/summary?productId={int}  [AllowAnonymous]
  Returns: ApiResponse<ProductRatingSummaryDto>
  Fields: ProductId, TotalReviews, AvgRating,
          Rating1Count, Rating2Count, Rating3Count, Rating4Count, Rating5Count

POST /api/productreview/create  [Authorize]
  Body: { ProductId, CustomerId, OrderId?, Rating (1-5), ReviewTitle?, ReviewText? }

--- CART (all [Authorize]) ---

GET    /api/cart/get?customerId={int}
  Returns: CartDto { CartId, CustomerId, Items[]: { CartItemId, ProductId, ProductName, ProductImage, Quantity, UnitPrice, TotalAmount } }
POST   /api/cart/add          Body: { CustomerId, ProductId, Quantity, UnitPrice }
PUT    /api/cart/updatequantity  Body: { CartItemId, Quantity }
DELETE /api/cart/removeitem    Body: { CartItemId }
DELETE /api/cart/clear?customerId={int}
POST   /api/cart/checkout?customerId={int}

--- ORDERS ([Authorize]) ---

POST /api/order/create-cod    Body: CreateCODOrderDto { CustomerId, PaymentMethod, ShippingAddress, Items[], DeliveryNotes }
GET  /api/order/getall?customerId={int}
GET  /api/order/getbyid?orderId={int}

--- AUTH (port 5100) ---

POST /api/auth/login     Body: { Username, Password } → { Token, Role, Username, UserId }
POST /api/auth/register  Body: { Username, Password, Email, FullName, Phone, RoleID }
GET  /api/auth/profile?userId={int}

====================================================================
INTEGRATION PLAN — STEP BY STEP
====================================================================

PHASE 1: Environment + Base Service Setup
------------------------------------------
Files to change: src/environments/environment.development.ts

  Update ports if needed. Currently:
    apiBaseUrl: 'https://localhost:7140'  → Auth
    apiBaseUrlForProduct: 'https://localhost:7064' → Inventory
  Confirm these match the actual .NET launchSettings.json ports.

Files to change: src/app/common/end-point/shop-Urls.ts
  Add missing endpoints:
    static categoryDetail = '/api/Category/getall';
    static stockUpdate = '/api/Stock/update';

  Fix: getecommerceproductdetails currently appends ID without query param.
    Current: '/api/Product/getecommerceproductdetails?productId='
    API expects: '/api/Product/getecommerceproductdetails?id='  ← verify

Files to change: src/app/common/end-point/product-review-Urls.ts
  No changes needed. Endpoints match API.

PHASE 2: Shop Page (ShopCategoriesComponent) — Dynamic Products
-----------------------------------------------------------------
Target: src/app/pages/shop/shop-categories/

Current state: Has service wiring (getecommerceproducts, getCategoryList),
               template has product grid + category sidebar + filters.

What to wire:
  1. ngOnInit → call getecommerceproducts() and getCategoryList()
  2. Products bind via *ngFor with product card template
  3. Category sidebar: click category → call getecommerceproducts(categoryId=X)
  4. Price sort: client-side sort on returned array
  5. Category filter: client-side OR server-side (categoryId param)

Template mapping (Sukunda v6 categories.html CSS classes):
  Product card:    .cs_product_style_1
  Product thumb:   .cs_product_thumb
  Product info:    .cs_product_info
  Product title:   .cs_product_title → {{ product.productName }}
  Product price:   .cs_product_price → {{ product.salesPrice | currency:'NPR' }}
  Product rating:  .cs_rating → data-rating="{{ product.avgRating }}"
  Product image:   [src]="product.productImage"
  Product link:    [routerLink]="['/shop/shop-single', product.productId]"
  Category sidebar: .cs_filter_col → *ngFor="let cat of categories"

PHASE 3: Product Detail (ShopSingleComponent) — Dynamic Data
--------------------------------------------------------------
Target: src/app/pages/shop/shop-single/

Current state: Fully hardcoded v6 replica. All product data is static.
               TS already has service wiring + method calls.
               Template has NO data bindings (0 bindings, 0 ngFor).

What to do:  Map hardcoded values → dynamic bindings. 
             Do NOT rewrite the template. Find-replace each hardcoded
             value with {{ product.X }} binding. Keep all CSS classes.

Detailed mapping:

  BREADCRUMB:
    "Aria Diamond Pendant" (L16)
      → {{ product.productName }}

  PAGE HEADER:
    "Product Details" (L10)
      → Keep as-is (static page title, same in v6 original)

  IMAGE GRID (L18-L48):
    5 hardcoded <img src> tags
      → API returns single ProductImage URL only.
      → Solution: Use productImage as the main large image.
        If ProductVariants exist, show variant color swatches.
        For the grid, repeat the same image OR use a placeholder
        for thumbnails until multi-image upload is built.
      → [src]="product.productImage"
      → Show alt text: [alt]="product.productName"

  PRODUCT INFO (L50-L100):
    Product Name (L55):
      "Aria Diamond Pendant" → {{ product.productName }}

    Product Tag (L52):
      "Limited Edition | Diamond Collection"
      → {{ product.categoryName }} | {{ product.companyName }}
      (or keep static until tags are added)

    Stock Status (L53):
      "In Stock"
      → *ngIf="product.inStock" class="cs_product_stock">In Stock</span>
      → *ngIf="!product.inStock">Out of Stock</span>

    Rating Stars (L57-L59):
      data-rating="5"
      → [attr.data-rating]="product.avgRating"
      (Review JS review() sets width based on data-rating)

    Review Count (L60):
      "4.8 (1245 reviews)"
      → {{ product.avgRating | number:'1.1-1' }} ({{ product.totalReviewCount }} reviews)

    Sold Count (L61):
      "50+ Sold out this week"
      → Remove or replace with stock info: {{ product.availableQty }} in stock

    Price (L64):
      "NPR 490.00" → {{ product.salesPrice | currency:'NPR':'symbol':'1.2-2' }}

    Strikethrough (L65):
      "NPR 620" → {{ product.comparePrice | currency:'NPR':'symbol':'1.2-2' }}
      *ngIf="product.comparePrice"

    Save Badge (L66):
      "Save 22%" → *ngIf="product.discountPercent > 0"
      Save {{ product.discountPercent }}%

    Description (L67):
      Hardcoded text → {{ product.description || product.shortName }}

  SWATCHES / OPTIONS (L68-L86):
    Metal finish swatches → if HasVariant, render from ProductVariants[]:
      *ngFor="let variant of product.productVariants"
      {{ variant.color }} or {{ variant.size }}
    If no variants → hide or show single static option

  QUANTITY + BUY (L88-L100):
    Quantity selector → already functional (jQuery counterInit)
    Add to Cart button:
      (click)="addToCart()"
      → calls ShopCommonService.postCart({
           customerId: authService.getCustomerId(),
           productId: product.productId,
           quantity: selectedQuantity,
           unitPrice: product.salesPrice
         })
    Wishlist button → similar with wishlist API

  TABS: Product Details / Specifications / Shipping / Reviews
    Tab 1 (Product Details L114-L116):
      → {{ product.description }}
    Tab 2 (Specifications L117-L130):
      → Hardcoded specs list. Map:
        "Weight: Approx. 18.5g" → keep static until variant weight field exists
        "SKU:" → {{ product.sku }}
    Tab 3 (Shipping L131-L142):
      → Keep static (same for all products)
    Tab 4 (Reviews L143-L200):
      → Call GET /api/productreview/summary?productId=X
        for the rating summary bars (Rating1Count through Rating5Count)
      → Call GET /api/productreview/getbyproduct?productId=X
        for the review list items

  REVIEW SUMMARY (inside Customer Reviews tab):
    "4.9" score (L152):
      → {{ reviewSummary.avgRating | number:'1.1-1' }}
    "Based on 127 reviews" (L156):
      → Based on {{ reviewSummary.totalReviews }} reviews
    Progress bars (L158-L175):
      data-progress="82" → [attr.data-progress]="reviewSummary.rating5Count / reviewSummary.totalReviews * 100"
      "82%" → {{ (reviewSummary.rating5Count / reviewSummary.totalReviews * 100) | number:'1.0-0' }}%
      (repeat for 5 star, 4 star, 3 star, 2 star, 1 star)
    After binding: re-call review() to re-render the progress bar widths.

  REVIEW LIST (L177-L210):
    3 hardcoded review items
      → *ngFor="let review of reviews"
      Author: {{ review.reviewTitle || 'Anonymous' }}
      Date:   {{ review.reviewDate | date:'MMMM d, yyyy' }}
      Rating: [attr.data-rating]="review.rating"
      Text:   {{ review.reviewText }}

  REVIEW FORM (L211-L240):
    POST /api/productreview/create
    Requires auth (customerId + token).
    → wire star rating input + form submission

  RELATED PRODUCTS (L242-L320):
    4 hardcoded product cards
      → Call getecommerceproducts() already in TS.
      → Filter by same categoryId, exclude current product.
      → Already done: applyRelatedProductsFilter() in TS.
      → *ngFor="let rp of relatedProducts"

  STICKY SCROLL (L48-L100):
    .cs_product_info_main.cs_sticky
      → Position: sticky; top: 140px
      → Fix: Add align-self: flex-start on .col-lg-7
      → Ensure left column is taller than right (image grid must be > viewport)

PHASE 4: Cart Integration
---------------------------
Files: shop-cart.component.ts, check-out.component.ts, header component

  Cart badge count in header:
    → Call /api/cart/get?customerId=X on init
    → Update badge via CartEventService.notifyCartUpdate()

  Add to Cart from product detail:
    → Already wired in ShopCommonService.postCart()

  Cart page: already has API integration (6 subscribes).
    Verify it works with the real API.

PHASE 5: Auth Integration
---------------------------
Files: user-admin/core/auth/login/, register/

  Login flow:
    POST http://localhost:5100/api/auth/login
    → Store token via AuthService.setCustomerToken()
    → Store userId via AuthService.setCustomerId()

  Guard:
    customerAuthGuard already protects cart/checkout/wishlist routes.

PHASE 6: Wishlist Integration
-------------------------------
  Check existing wishlist service (only 2 service imports, 0 subscribes).
  → May need to add API endpoints to ShopCommonService.
  → Check if API has a wishlist endpoint (not found in current API).
    If not: wishlist is client-side (localStorage) until API supports it.

====================================================================
ORDER OF IMPLEMENTATION (recommended)
====================================================================

Day 1:
  1. Confirm API ports + start both .NET services
  2. Test endpoints manually (Postman/curl) to verify responses
  3. PHASE 1: Environment + endpoint URL fixes

Day 2:
  4. PHASE 2: Shop page — dynamic product listing with category filter
  5. PHASE 3: Shop-single — product detail from API (name, price, stock, images)
  6. PHASE 3: Reviews tab — wire summary + review list
  7. PHASE 4: Cart integration — add-to-cart, cart page, header badge

Day 3:
  8. PHASE 5: Auth — login/register flow
  9. PHASE 6: Wishlist
  10. Sticky scroll fix
  11. Cross-page testing

====================================================================
CRITICAL NOTES
====================================================================

1. TWO BASE URLs in environment.ts:
   - apiBaseUrl (port 7140) = Auth service
   - apiBaseUrlForProduct (port 7064) = Inventory service
   ShopCommonService already uses both correctly.

2. ProductReviewService uses apiBaseUrlForProduct (Inventory port 7064).
   The review endpoints ARE on the Inventory service, not Auth.

3. The ProductReviewService has a WRONG endpoint:
   Endpoint.updateStatus = '/api/PetType/changestatus?id='
   Should be: '/api/ProductReview/changestatus?reviewId='
   Fix this in product-review-Urls.ts.

4. The getecommerceproductdetails endpoint uses ?id= NOT ?productId=
   But the current shop-Urls.ts has: '/api/Product/getecommerceproductdetails?productId='
   Verify which the API actually expects. The C# code shows:
     [HttpGet("getecommerceproductdetails")]
     IActionResult GetEcommerceProductDetails(int productId, int? branchId = null)
   So: ?productId= should be correct (ASP.NET binding from query string).

5. Review JS re-init:
   After Angular renders review data, call review() to set progress bar widths.
   Already handled in selectTab() — ensure it fires after API data arrives.

6. Star rating data-rating attribute:
   The CSS uses [data-rating] to calculate fill width.
   For product rating: [attr.data-rating]="product.avgRating"
   For review items: [attr.data-rating]="review.rating"
   After DOM updates, call review() to re-render.


====================================================================
API COVERAGE — USER PANEL (what exists)
====================================================================

FEATURE                    ENDPOINT                                         AUTH          STATUS
------------------------------------------------------------------------------------------
Product listing            GET /api/product/getecommerceproducts             AllowAnon     ✅
Product detail             GET /api/product/getecommerceproductdetails       AllowAnon     ✅
Category list              GET /api/category/getall                          AllowAnon     ✅
Brand list                 GET /api/brand/getall                             AllowAnon     ✅
Product type list          GET /api/producttype/getall                       AllowAnon     ✅
Pet type list              GET /api/pettype/getall                           AllowAnon     ✅
Unit list                  GET /api/unit/getall                              AllowAnon     ✅
Reviews (read)             GET /api/productreview/getbyproduct               AllowAnon     ✅
Reviews (summary)          GET /api/productreview/summary                    AllowAnon     ✅
Reviews (write)            POST /api/productreview/create                    Authorize     ✅
Cart (add)                 POST /api/cart/add                                Authorize     ✅
Cart (update qty)          PUT  /api/cart/updatequantity                     Authorize     ✅
Cart (remove item)         DELETE /api/cart/removeitem                       Authorize     ✅
Cart (get)                 GET  /api/cart/get                                Authorize     ✅
Cart (clear)               DELETE /api/cart/clear                            Authorize     ✅
Cart (checkout)            POST /api/cart/checkout                           Authorize     ✅
Order (create COD)         POST /api/order/create-cod                        Authorize     ✅
Order (my orders)          GET  /api/order/getall                            Authorize     ✅
Order (by id)              GET  /api/order/getbyid                           Authorize     ✅
Payment (eSewa initiate)   POST /api/payment/initiate                        Authorize     ✅
Payment (eSewa callback)   GET  /api/payment/esewa/success                   AllowAnon     ✅
Payment (status)           GET  /api/payment/{paymentId}                     Authorize     ✅
Auth (login)               POST http://localhost:5100/api/auth/login         AllowAnon     ✅
Auth (register)            POST http://localhost:5100/api/auth/register      AllowAnon     ✅
Auth (profile)             GET  http://localhost:5100/api/auth/profile       AllowAnon     ✅
Auth (update profile)      PUT  http://localhost:5100/api/auth/profile       AllowAnon     ✅
Notifications (unread)     GET  /api/notification/unread-count                Authorize     ✅
Notifications (read one)   POST /api/notification/{id}/read                  Authorize     ✅
Notifications (mark all)   POST /api/notification/mark-all-read              Authorize     ✅
Notifications (promotions) POST /api/notification/promotion                  Authorize     ✅
AI chat                    POST /api/ai/chat                                 AllowAnon     ✅
Appointment book           POST /api/appointment/bookappointment             AllowAnon     ✅

TOTAL USER ENDPOINTS: 32 covered

====================================================================
API COVERAGE — ADMIN PANEL (what exists)
====================================================================

FEATURE                    ENDPOINT                                         AUTH          STATUS
------------------------------------------------------------------------------------------
Product save (multipart)   POST /api/product/save                            Authorize     ✅
Product update (multipart) PUT  /api/product/update                          Authorize     ✅
Product get by id          GET  /api/product/getbyid                         Authorize     ✅
Product get all            GET  /api/product/getall                          Authorize     ✅
Product change status      PUT  /api/product/changestatus                    Authorize     ✅
Product image update       PUT  /api/product/updateproductimage              Authorize     ✅
Category CRUD + status     /api/category/{save,update,delete,getbyid...}    AllowAnon     ✅
Brand CRUD + status        /api/brand/{save,update,delete,getbyid...}       AllowAnon     ✅
Product Type CRUD + status /api/producttype/{save,update,delete,getbyid..}  AllowAnon     ✅
Pet Type CRUD + status     /api/pettype/{save,update,delete,getbyid...}     AllowAnon     ✅
Unit CRUD + status         /api/unit/{save,update,delete,getbyid...}        AllowAnon     ✅
Branch CRUD + status       /api/branch/{save,update,delete,getbyid...}      Authorize     ✅
Company get/delete         /api/company/{companyId}                          Authorize     ✅
Product Variant CRUD       /api/productvariant/{save,update,getbyid...}     Authorize     ✅
Product Batch CRUD         /api/productbatch/{save,update,getbyid,all..}    Authorize     ✅
Stock update + list        /api/stock/{update,by-product,all}               Authorize     ✅
Stock Reports              /api/stockreport/{on-hand,ledger}                Authorize     ✅
Order (admin list)         GET  /api/order/admin-list                        Authorize     ✅
Order change status        PUT  /api/order/changestatus                      Authorize     ✅
Order cancel               PUT  /api/order/cancel                            Authorize     ✅
Payment CRUD + status      /api/payment/{create,success,failed,...}          Authorize     ✅
Dashboard                  (summary, recent orders, low stock, revenue)      Authorize     ✅
User list (admin)          GET  /api/auth/allusers                           Authorize     ✅
Role CRUD + status         /api/role/{save,update,delete,getbyid...}        Authorize     ✅
Fiscal Year CRUD           (get, delete, changestatus, bookclose)            Authorize     ✅
Prefix/Suffix CRUD         (save, update, delete, getbyid, getall, status)   Authorize     ✅
Appointment admin          /api/appointment/{getall,getbyid,status,cancel}  AllowAnon     ✅
Promotion (send)           POST /api/notification/promotion                  Authorize     ✅
Auth (change password)     POST http://localhost:5100/api/auth/changepassword Authorize    ✅
Auth (delete user)         DELETE http://localhost:5100/api/auth/{userId}     Authorize    ✅

TOTAL ADMIN ENDPOINTS: 85 covered

====================================================================
GAPS — WHAT THE API IS MISSING
====================================================================

--- CRITICAL (blocks core user features) ---

1. WISHLIST
   No API endpoint exists. Current: localStorage only.
   Needed:
     POST /api/wishlist/add         Body: { customerId, productId }
     DELETE /api/wishlist/remove    Body: { customerId, productId }
     GET /api/wishlist/get?customerId=X
   DB: Wishlist (WishlistId, CustomerId, ProductId, CreatedDate)

2. PRODUCT SEARCH
   No search endpoint. Users cannot search by keyword.
   Needed:
     GET /api/product/search?q={keyword}&categoryId={int}&brandId={int}
   SQL: LIKE '%keyword%' on ProductName, Description, SKU, ProductCode

3. ORDER TRACKING (step-by-step status)
   GET /api/order/getall returns OrderStatus int but no tracking timeline.
   Needed:
     GET /api/order/tracking?orderId=X
   Returns: [{ statusName, statusDate, note }]
   DB: OrderStatusLog (LogId, OrderId, Status, StatusDate, Note)

4. PASSWORD RESET (email-based)
   POST /api/auth/requestreset and /reset exist but are stubs.
   Needed: generate OTP, store in DB, send email, verify on reset.
   DB: PasswordResetOtp (UserId, Otp, ExpiryDate, IsUsed)

--- IMPORTANT (enhances UX) ---

5. MULTI-IMAGE PRODUCT PHOTOS
   API returns single productImage field.
   Needed:
     GET /api/product/images?productId=X
     POST /api/product/images/upload (admin, multipart)
   DB: ProductImage (ImageId, ProductId, ImageUrl, DisplayOrder, IsPrimary)

6. PRODUCT TAGS
   Template has hardcoded "Limited Edition" tag.
   Needed: GET /api/product/tags?productId=X, POST /api/product/tags (admin)
   DB: ProductTag + ProductTagMapping

7. RELATED PRODUCTS (server-side)
   Currently client-side filter by categoryId.
   Needed: GET /api/product/related?productId=X&limit=4
   SQL: same category, exclude current, sort by avgRating desc

--- MINOR (nice-to-have, defer) ---

8. SHIPPING COST CALCULATOR
   No shipping logic. Needed: POST /api/shipping/calculate
   DB: ShippingRate (Zone, Weight, Cost)

9. REVIEW IMAGES
   Reviews have text only. Needed: add ImageUrls[] to review create.

10. USER NOTIFICATION PREFERENCES
    No endpoint to manage notification preferences.
    Needed: GET/PUT /api/notification/preferences

--- ADMIN-ONLY GAPS ---

11. AUDIT / ACTIVITY LOG
    No activity log. Needed: GET /api/auditlog?from=&to=&action=&userId=
    DB: AuditLog (LogId, UserId, Action, Entity, EntityId, Details, Timestamp)

12. BULK PRODUCT IMPORT
    No CSV/Excel import. Needed: POST /api/product/import (multipart file)

13. COUPON / DISCOUNT CODE SYSTEM
    No coupon model. Needed:
      POST /api/coupon/create (admin)
      POST /api/coupon/validate (user, before checkout)
      GET /api/coupon/list (admin)
    DB: Coupon (CouponId, Code, DiscountType, DiscountValue, MinOrder, MaxUses, ExpiryDate, IsActive)

14. BANNER / SLIDER CMS
    No homepage banner management. Needed:
      GET /api/banner/active (user, homepage carousel)
      POST /api/banner/save (admin)
    DB: Banner (BannerId, ImageUrl, Title, LinkUrl, DisplayOrder, IsActive)

15. BLOG CMS
    Blog pages are static. Needed:
      GET /api/blog/list, GET /api/blog/{id}, POST /api/blog/save (admin)
    DB: Blog (BlogId, Title, Content, ImageUrl, AuthorId, PublishedDate, IsActive)

====================================================================
PRIORITY ORDER FOR API GAPS
====================================================================

Phase 1 (before shop launch — MUST HAVE):
  #1 Wishlist
  #2 Search
  #3 Order tracking

Phase 2 (after shop launch — HIGH VALUE):
  #4 Password reset (email OTP)
  #5 Multi-image product photos
  #7 Related products (server-side)
  #13 Coupon / discount code system

Phase 3 (later — NICE TO HAVE):
  #6 Product tags
  #8 Shipping cost calculator
  #9 Review images
  #10 Notification preferences
  #11 Audit log
  #12 Bulk import
  #14 Banner CMS
  #15 Blog CMS

====================================================================
NOTES
====================================================================

- Auth endpoints are on the Auth service (port 5100), not Inventory (port 5000).
- Master project controllers (Category, Brand, ProductType, PetType, Unit, etc.)
  are on the SAME port 5000 as Inventory — Master is referenced by Inventory.
- AllowAnonymous endpoints do NOT need JWT token. Correct for: product browsing,
  category/brand listing, reviews reading.
- All other endpoints require Authorization: Bearer <JWT> header.


====================================================================
MASTER IMPLEMENTATION PLAN — USER + ADMIN PANEL (COMBINED)
====================================================================
Written for both: technical detail AND plain-language explanation
of every step. Work order is bottom-up: shared foundation first,
highest-value pages next, missing API features last.

How to read each step:
  • WHAT       — plain-language what we're building
  • WHY        — the reason it matters
  • TECHNICAL  — exact files, endpoints, classes to touch
  • DONE WHEN  — how you know the step is complete (visible test)


════════════════════════════════════════════════════════════════════
  STAGE A      (shared foundation — sets up everything)
════════════════════════════════════════════════════════════════════


STEP A1 — Start the API and verify it runs
------------------------------------------
• WHAT   — fire up the .NET backend so we have a live API to test against.
• WHY    — nothing else works until products actually load from the server.
• TECHNICAL
   - Open D:/Projects/Sukunda Metal/SukundaMetal/SukundaMetals.slnx
     in Visual Studio.
   - Run the full solution. Two services start:
         Auth service      → port 5100
         Inventory service → port 5000
   - Confirm both up:
         curl http://localhost:5000/api/product/getecommerceproducts
         curl http://localhost:5100/api/auth/login   (POST, expect 400 not connection error)
• DONE WHEN — both URLs respond (even an error body proves the server is alive).


STEP A2 — Align the Angular base URLs to the real API ports
--------------------------------------------------------------
• WHAT   — point Angular's two API addresses at the running backend.
• WHY    — Angular currently points at localhost:7140/7064; the real
           API runs on 5100/5000. Mismatch = every call fails.
• TECHNICAL
   File: src/environments/environment.development.ts
     apiBaseUrl            = 'https://localhost:5000'   (auth + master)
     apiBaseUrlForProduct  = 'https://localhost:7064'   (if inventory is on another port for the project) → but set to whatever launchSettings.json shows.
   IMPORTANT: confirm the ACTUAL ports from the .NET
   launchSettings.json files before writing these — do not guess.
• DONE WHEN — a product list call from the browser returns data, not a network error.


STEP A3 — Fix wrong endpoint paths (known bugs)
------------------------------------------------
• WHAT   — repair two endpoint URL mistakes in the Angular services.
• WHY    — they point to the wrong controller today, so those features
           silently fail even when the backend works.
• TECHNICAL
   Bug 1 — File: src/app/common/end-point/product-review-Urls.ts
     "updateStatus" = '/api/PetType/changestatus?id='   ← WRONG (PetType!)
     fix to           '/api/ProductReview/changestatus?reviewId='
   Bug 2 — verify query param for product details.
     File: src/app/common/end-point/shop-Urls.ts
     '...getecommerceproductdetails?productId='  — confirm the C# controller
     binds int productId (it does: GetEcommerceProductDetails(int productId)).
     Keep as productId= if so; only change if tests show it failing.
• DONE WHEN — product detail and review status-toggle calls hit the right controller.


STEP A4 — Verify the JWT auth interceptor
------------------------------------------
• WHAT   — make sure every API call automatically carries the login token.
• WHY    — cart, orders, review-submit, and all admin CRUD need a token;
           without one the server returns 401 for everything protected.
• TECHNICAL
   - Inspect the HTTP interceptor (src/app/shared-services/ or interceptors/).
   - Confirm it reads the stored token (AuthService.getCustomerToken()
     for shop users, getAdminToken() for admin) and adds:
        Authorization: Bearer <token>
   - Roles: shop users act as their customerId; admin acts as Admin role.
   - If no interceptor exists, create one and register it in app.config.
• DONE WHEN — a protected call (e.g. /api/cart/get) returns 200 with the
   token attached, 401 without it.


════════════════════════════════════════════════════════════════════
  STAGE B      (USER SHOP — the biggest chunk)
════════════════════════════════════════════════════════════════════


STEP B1 — Shop Listing Page (product cards)
--------------------------------------------
• WHAT   — replace hard-coded sample products with real ones from the server.
• WHY    — this is the front door of the store; customers see products here.
• TECHNICAL
   Page: src/app/pages/shop/shop-categories/  (ShopCategoriesComponent)
   Service already exists: ShopCommonService.getecommerceproducts()
   File: shop-categories.component.ts
     - ngOnInit() → this.service.getecommerceproducts().subscribe(...)
       store response array in this.products
     - ngOnInit() → this.service.getCategoryList().subscribe(...)
       store categories in this.categories
   File: shop-categories.component.html
     - *ngFor="let product of products" around each product card
     - title:    {{ product.productName }}
     - price:    {{ product.salesPrice | currency:'NPR':'symbol':'1.2-2' }}
     - compare:  {{ product.comparePrice | currency }} (ngIf present)
     - image:    [src]="product.productImage"
     - rating:   [attr.data-rating]="product.avgRating"
     - link:     [routerLink]="['/shop/shop-single', product.productId]"
   Filters:
     - category click → re-call getecommerceproducts(categoryId=X)
     - price sort → sort the client-side array (cheap) 
   CSS: keep all existing .cs_product_* classes (Sukunda v6 look).
• DONE WHEN — shop page shows real DB products with names, prices, images.


STEP B2 — Category & Brand filter sidebar
-------------------------------------------
• WHAT   — make the shop sidebar actually filter the product grid.
• WHY    — customers browse by category; without it the page is one flat list.
• TECHNICAL
   - Categories come from /api/category/getall.
   - Brands come from /api/brand/getall.
   - On click, call:
       getecommerceproducts(categoryId=selected, brandId=selected)
     The backend already accepts these query params.
   - Active filter gets a CSS highlight class (+ tab state).
• DONE WHEN — clicking a category/brand narrows the grid to matching products.


STEP B3 — Product Detail Page (the big one)
---------------------------------------------
• WHAT   — bind every hard-coded value on the product detail page to live data.
• WHY    — today the detail page shows one fixed sample product; customers
           must see the actual product they clicked.
• TECHNICAL
   Page: src/app/pages/shop/shop-single/  (ShopSingleComponent)
   Read id from the URL:  this.route.paramMap → productId
   Service already exists: ShopCommonService.getecommerceproductdetails(id)
   Replace hard-coded template values with bindings:
     breadcrumb name      → {{ product.productName }}
     main image           → [src]="product.productImage"
     product name (h2)    → {{ product.productName }}
     in-stock label       → *ngIf="product.inStock" / else "Out of Stock"
     rating stars         → [attr.data-rating]="product.avgRating"
     review count         → {{ product.avgRating | number:'1.1-1' }}
                            ({{ product.totalReviewCount }} reviews)
     price                → {{ product.salesPrice | currency:'NPR':'symbol':'1.2-2' }}
     compare price (strike)→ {{ product.comparePrice | currency }} (ngIf)
     save badge           → *ngIf="product.discountPercent > 0"
                            Save {{ product.discountPercent }}%
     description          → {{ product.description }}
     SKU                  → {{ product.sku }}
     variant swatches     → *ngFor="let v of product.productVariants"
                            only if product.hasVariant
   Add to Cart button → (click)="addToCart()"
     addToCart() calls ShopCommonService.postCart({
        customerId: authService.getCustomerId(),
        productId: this.product.productId,
        quantity: this.qty,
        unitPrice: this.product.salesPrice,
     })
   Related products → *ngFor="let rp of relatedProducts"
     (filter logic already in TS: applyRelatedProductsFilter())
• DONE WHEN — opening any product shows that product's real name, price,
   image, description. Add-to-cart lands an item in the cart.


STEP B4 — Reviews tab on the product detail page
--------------------------------------------------
• WHAT   — load real customer reviews and the star-summary bars.
• WHY    — reviews drive purchase decisions; today they are sample text.
• TECHNICAL
   Services exist: ProductReviewService.getByProductId(id) and summary.
   Reviews tab:
     - GET /api/productreview/getbyproduct?productId=X
       → *ngFor="let r of reviews" render name/date/rating/text
     - GET /api/productreview/summary?productId=X
       → fill the 1-5 star progress bars using Rating1..5Count / total
   After data loads, re-call window.__sukunda.review() to re-render the
   progress bars and star fills (the jQuery helper).
   Submit review:
     - POST /api/productreview/create  (Body: productId, customerId,
       rating 1-5, reviewTitle, reviewText)
     - Requires login → redirect to /login if customerId missing.
• DONE WHEN — the reviews tab shows real reviews + correct summary bars,
   and a logged-in user can post a review.


STEP B5 — Cart page + header badge
------------------------------------
• WHAT   — make the cart page and the header icon/this count live.
• WHY    — customers need to see/edit what they're about to buy.
• TECHNICAL
   Cart page already wired (6 subscribes) — verify against real API.
     GET  /api/cart/get?customerId=X
     PUT  /api/cart/updatequantity   Body {cartItemId, quantity}
     DELETE /api/cart/removeitem      Body {cartItemId}
     DELETE /api/cart/clear           body/simple
   Header cart badge:
     - on init call getCartList(customerId)
     - this.cartEventService.notifyCartUpdate(items)
     - header subscribes to cartEventService → updates count
   Add to cart, quantity +/-, remove, clear all → live update badge.
• DONE WHEN — adding to cart updates the badge; cart page reflects it.


STEP B6 — Checkout + place order (COD)
----------------------------------------
• WHAT   — let a logged-in customer submit an order for cash on delivery.
• WHY    — this is where the store makes money.
• TECHNICAL
   Page: src/app/pages/shop/check-out/
   Service exists via ShopCommonService.
     POST /api/order/create-cod
       Body: CreateCODOrderDto {
         customerId,
         paymentMethod: "COD",
         shippingAddress: { fullName, phone, addressLine1, city,
                            state, postalCode, landmark },
         items: [{ productId, quantity, unitPrice }],
         deliveryNotes
       }
     Response → CreateCODOrderResultDto { orderId, orderNumber }
   On success:
     - clear the cart
     - toast "Order #XX placed"
     - redirect to confirmation page (pass orderId)
   eSewa path (later): POST /api/payment/initiate then redirect to the
   eSewa URL; the /api/payment/esewa/success callback finalizes it.
• DONE WHEN — submitting the form creates a real order with an order number.


STEP B7 — Order history + tracking (needs API gap #3)
-------------------------------------------------------
• WHAT   — show the customer their past orders and their live status.
• WHY    — customers expect to see where their order is.
• TECHNICAL
   Existing pages have static data; wire:
     Order history page → GET /api/order/getall?customerId=X
     Track page         → GET /api/order/tracking?orderId=X   (NEW endpoint,
                          part of API gap #3 — we build it on the backend)
   Status steps: Pending → Processing → Shipped → Delivered.
   Visual: vertical timeline, current step highlighted.
• DONE WHEN — a logged-in customer sees their orders and a real status timeline.


STEP B8 — Wishlist (needs API gap #1)
---------------------------------------
• WHAT   — build a saved-items list that survives logout (DB-backed).
• WHY    — today wishlist is localStorage only; the API has no wishlist.
• TECHNICAL
   Backend (Stage D): add WishlistController + spWishlist.
   Angular: new WishlistService
     POST /api/wishlist/add, DELETE /api/wishlist/remove,
     GET  /api/wishlist/get?customerId=X
   Heart icon on product cards/detail toggles add/remove.
   Wishlist page renders saved items with pull-to-cart.
• DONE WHEN — hearting a product saves it; it persists after re-login.


STEP B9 — Product search (needs API gap #2)
---------------------------------------------
• WHAT   — let customers search products by typing a keyword.
• WHY    — basic store functionality; not implementable today.
• TECHNICAL
   Backend (Stage D): add ?q= filter or /api/product/search?q=...
     SQL: WHERE ProductName LIKE '%q%' OR ShortName LIKE OR SKU LIKE
          OR ProductCode LIKE (optionally filtered by category/brand)
   Angular: search box in the shop header → calls the search endpoint
   and swaps the grid results.
• DONE WHEN — typing in the search box returns matching products.


════════════════════════════════════════════════════════════════════
  STAGE C      (ADMIN PANEL — already ~90% wired, finish weak spots)
════════════════════════════════════════════════════════════════════

Admin is in BETTER shape than the user shop — the CRUD modules already
call the API. This stage finishes the few weak pieces and fixes wiring.


STEP C1 — Verify all admin CRUD modules against the real API
---------------------------------------------------------------
• WHAT   — run each admin module and fix any broken endpoint wiring.
• WHY    — modules are wired but untested against the live backend;
           wrong paths/params will surface here.
• TECHNICAL
   Walk each module and confirm list→add→edit→delete works:
     Products, Categories, Brands, Product Types, Pet Types, Units,
     Branches, Companies, Product Variants, Product Batches,
     Stock, Stock Ledger, Roles, Prefix/Suffix, Fiscal Year.
   Each has its own service + endpoint file — fix URLs like we did in A3.
• DONE WHEN — admin can create/read/update/delete records in every module.


STEP C2 — Complete the Dashboard
----------------------------------
• WHAT   — load live stats instead of the near-empty summary.
• WHY    — the dashboard is the admin home screen; it should show real numbers.
• TECHNICAL
   File: src/app/admin/core/dashboard/dashboard.component.ts (1 subscribe)
   Wire to the existing /api/dashboard endpoints:
     - total revenue (chart)
     - today's orders / total orders
     - low-stock products list
     - recent orders table
• DONE WHEN — dashboard shows real totals, a sales chart, and low-stock list.


STEP C3 — Complete Orders management (admin)
---------------------------------------------
• WHAT   — let admin view all orders, change status, cancel.
• WHY    — this is the operational core; 3 subscribes today = partial.
• TECHNICAL
   File: src/app/admin/core/orders/orders.component.ts
     GET  /api/order/admin-list   → full order table w/ customer + delivery
     PUT  /api/order/changestatus → dropdown Pending→Processing→Shipped→Delivered
     PUT  /api/order/cancel        → cancel button (guard + confirm)
• DONE WHEN — admin sees every order, can advance its status, and cancel.


STEP C4 — Complete Product form (image + variants)
----------------------------------------------------
• WHAT   — polish the product admin form with multi-image + variant editing.
• WHY    — the shop needs multiple photos and variant control; form has 15
           subscribes but lacks multi-image (needs API gap #5).
• TECHNICAL
   Backend (Stage D): ProductImage endpoints (gap #5).
   Angular products form:
     - image upload → POST /api/product/images/upload
     - gallery shows multiple images, set primary
     - variant editor: size/color/price per ProductVariantDto
• DONE WHEN — admin uploads several images per product, picks a primary,
   manages variants.


STEP C5 — Decide the 3 static "organization" pages
----------------------------------------------------
• WHAT   — handle Company Details / Department / Leave Setup leftovers.
• WHY    — these are static template pages from the Jewlfy template;
           they likely don't belong in a jewellery shop admin.
• TECHNICAL
   Option (recommended): remove their menu entries + routes.
   Option:  leave hidden behind a feature flag.
   Do NOT leave them visibly static in the menu — looks unfinished.
• DONE WHEN — admin menu is clean (no dead/static placeholders).


STEP C6 — Product Review management (admin)
----------------------------------------------
• WHAT   — let admin moderate reviews (approve/hide/delete).
• WHY    — reviews appear on the shop; admin needs control over spam.
• TECHNICAL
   File: src/app/admin/core/product-review/ (already 4 subscribes)
     GET  /api/productreview/getall        → all reviews
     PUT  /api/productreview/changestatus  → approve / hide
   (review-status endpoint bug from A3 must be fixed first.)
• DONE WHEN — admin can approve or hide any customer review.


════════════════════════════════════════════════════════════════════
  STAGE D      (WRITE THE MISSING API FEATURES — backend work)
════════════════════════════════════════════════════════════════════

These backfill the gaps listed earlier. They are added to the
D:/Projects/Sukunda Metal/SukundaMetal project using the SAME pattern
as existing code (controller → service → repository → stored proc).


STEP D1 — Wishlist API  (gap #1)           [used by user shop B8]
------------------------------------------------
• WHAT   — add a server-side saved-items feature.
• TECHNICAL
   New: Inventory/Controllers/WishlistController.cs
        + WishlistDto.cs + WishlistService + WishlistRepository
   Endpoints:
     POST   /api/wishlist/add        { customerId, productId }
     DELETE /api/wishlist/remove     { customerId, productId }
     GET    /api/wishlist/get?customerId=X
   Stored proc: dbo.spWishlist  (Flag 1=add, 2=remove, 3=get)
   Table: Wishlist (WishlistId, CustomerId, ProductId, CreatedDate)
• DONE WHEN — Postman can add/remove/fetch a wishlist for a customer.
   Reuse the EcommerceProductDto shape for the get response so the
   Angular card template renders it unchanged.


STEP D2 — Product Search API  (gap #2)      [used by user shop B9]
------------------------------------------------
• WHAT   — add keyword search for products.
• TECHNICAL
   Extend ProductController:
     GET /api/product/search?q=&categoryId=&brandId=
   Repository: WHERE (ProductName LIKE '%q%' OR ShortName LIKE '%q%'
     OR SKU LIKE '%q%' OR ProductCode LIKE '%q%')
     AND optional categoryId/brandId/branchId
   Returns List<EcommerceProductDto> (reuse the DTO).
• DONE WHEN — Postman search returns matched products.


STEP D3 — Order Tracking API  (gap #3)      [used by user shop B7]
------------------------------------------------
• WHAT   — return a step-by-step status timeline for an order.
• TECHNICAL
   New endpoint: GET /api/order/tracking?orderId=X
   Create OrderStatusLog table + log a row on every status change
   (tie into existing OrderService.ChangeStatus).
   Response: order info + list of { statusName, statusDate, note }.
• DONE WHEN — Postman returns an ordered status history for an order.


STEP D4 — Multi-image product photos  (gap #5)   [used by admin C4]
------------------------------------------------
• WHAT   — let admin upload several photos per product + user shows gallery.
• TECHNICAL
   New ProductImage table + endpoints:
     GET  /api/product/images?productId=X
     POST /api/product/images/upload   (multipart, admin)
   Update getecommerceproductdetails to also return productImages[].
• DONE WHEN — admin uploads multiple images; the detail page shows a gallery.


STEP D5 — Related products  (gap #7)       [upgrades shop B1/B3]
------------------------------------------------
• WHAT   — server-side "you may also like" recommendations.
• TECHNICAL
   GET /api/product/related?productId=X&limit=4
   SQL: same CategoryId, exclude current, order by AvgRating desc.
• DONE WHEN — Postman returns 4 products in the same category.

════════════════════════════════════════════════════════════════════
  STAGE E      (advanced admin features — build API + UI together)
════════════════════════════════════════════════════════════════════


STEP E1 — Coupon / discount system  (gap #13)
------------------------------------------------
• WHAT   — admin creates discount codes, customers redeem at checkout.
• TECHNICAL
   Backend:
     POST /api/coupon/create   (admin)
     POST /api/coupon/validate (user — check code before checkout)
     GET  /api/coupon/list     (admin)
     Table: Coupon (Id, Code, DiscountType, DiscountValue, MinOrder,
                    MaxUses, ExpiryDate, IsActive)
   Angular checkout: coupon input → validate → apply discount to total.
• DONE WHEN — a valid code reduces the checkout total; invalid code shows error.


STEP E2 — Banner / slider CMS  (gap #14)
------------------------------------------
• WHAT   — admin manages the homepage carousel images from a panel.
• TECHNICAL
   Backend:
     GET  /api/banner/active   (user — homepage carousel)
     POST /api/banner/save     (admin, upload)
     GET  /api/banner/list     (admin)
     Table: Banner (Id, Image, Title, LinkUrl, DisplayOrder, IsActive)
   User homepage: fetch active banners → build the Swiper/slick slider.
   Admin: new Banner module → upload + reorder + toggle active.
• DONE WHEN — admin uploads a banner and it appears on the homepage slider.


STEP E3 — Audit / activity log  (gap #11)
-------------------------------------------
• WHAT   — record who did what in admin (create/edit/delete).
• WHY    — accountability and troubleshooting.
• TECHNICAL
   Backend:
     GET /api/auditlog?from=&to=&action=&userId=
     Table: AuditLog (Id, UserId, Action, Entity, EntityId, Details, Timestamp)
   Optionally add middleware/service that logs key CRUD calls automatically.
   Admin: new Audit Log page with filters.
• DONE WHEN — admin actions appear in an audit trail with user + timestamp.


STEP E4 — Bulk product import  (gap #12)
------------------------------------------
• WHAT   — upload a CSV/Excel to create many products at once.
• TECHNICAL
   Backend: POST /api/product/import (multipart file)
     Parse rows → validate → insert → return success/failure count
   Admin: import button on Products page → file picker → result toast.
• DONE WHEN — uploading a CSV creates the listed products (or reports bad rows).

════════════════════════════════════════════════════════════════════
  STAGE F      (polish + cross-cutting)
════════════════════════════════════════════════════════════════════


STEP F1 — Sticky scroll fix (product detail)
------------------------------------------------
• WHAT   — make the buy-section stay visible while scrolling the gallery.
• WHY    — a long-known issue; the right column should stick.
• TECHNICAL
   File: src/assets/css/sukunda-overrides.css (or style_7)
     .cs_product_info_main.cs_sticky {
       position: sticky;
       top: 140px;
     }
   Parent .row { align-items: flex-start } so columns don't stretch equal.
   Ensure the left image grid is taller than the viewport (real images →
   already tall once real products load). If still short, this resolves
   itself once multi-image gallery (D4) is in.
• DONE WHEN — scrolling the gallery keeps the price/buy box pinned on screen.


STEP F2 — Loading states + error handling everywhere
------------------------------------------------------
• WHAT   — every page shows a spinner while loading and an error message
           if the API fails.
• WHY    — no blank/glitchy pages against a slow or down server.
• TECHNICAL
   Add isLoading / error flags per component; use *ngIf="isLoading" spinner,
   *ngIf="error" message. Wrap subscriptions with finalize()/catchError.
• DONE WHEN — navigating any data page shows spinner → data, or a clear error.


STEP F3 — Toasts + empty states
----------------------------------
• WHAT   — feedback for actions (added to cart, order placed) and friendly
           "nothing here yet" messages on empty lists.
• TECHNICAL
   ngx-toastr is already installed (ToastrService) — use on all actions.
   Empty states: *ngIf="products.length===0" → "No products found."
• DONE WHEN — every add/remove/place action shows a toast; empty lists
   show a message instead of a blank area.


STEP F4 — Role-based admin menu
----------------------------------
• WHAT   — show/hide admin menu items depending on the logged-in role.
• WHY    — SuperAdmin/Admin/Manager should see different tools.
• TECHNICAL
   Read activeRole from AuthService. Gate sidebar sections by role.
   e.g. Users & Roles only for SuperAdmin; Orders for all admins.
• DONE WHEN — a Manager and a SuperAdmin see different admin menus.


STEP F5 — Pagination on long lists
-------------------------------------
• WHAT   — split large product/order lists into pages.
• WHY    — hundreds of rows freeze the page; pagination keeps it usable.
• TECHNICAL
   Client-side pagination (MatPaginator or ngx-pagination) on admin lists
   and the shop grid. (Backend paging is a later optimization.)
• DONE WHEN — a 300-product list shows 10-20 per page with page controls.

════════════════════════════════════════════════════════════════════
  RECOMMENDED WORK SEQUENCE (day by day)
════════════════════════════════════════════════════════════════════

DAY 1 — Foundation + shop listing
  A1 start API → A2 align ports → A3 fix endpoints → A4 auth interceptor
  B1 shop listing cards → B2 category filter

DAY 2 — Product detail + cart + orders
  B3 product detail bindings → B4 reviews tab → B5 cart + badge
  B6 checkout (COD) → C1 verify admin CRUD → C2 dashboard → C3 orders

DAY 3 — Write missing API + finish features
  D1 wishlist + B8 → D2 search + B9 → D3 tracking + B7
  D4 multi-image + C4 product form → D5 related
  B7 order history + tracking page

DAY 4 — Advanced admin + polish
  E1 coupons → E2 banners → E3 audit → E4 bulk import
  C5 clean static org pages → C6 review moderation
  F1 sticky → F2 loading → F3 toasts → F4 roles → F5 pagination

════════════════════════════════════════════════════════════════════
  DEPENDENCY MAP (what must finish before what)
════════════════════════════════════════════════════════════════════

  A1-A4  → everything (foundation)
  A2     → B1 (shop needs correct base URL)
  A3     → C6 (review status endpoint must be right)
  A4     → B5, B6, all admin CRUD (need token)
  B1     → B2 (filters act on the loaded grid)
  B3     → B5 (add-to-cart feeds the cart)
  B5     → B6 (checkout reads the cart)
  D1     → B8 (wishlist page needs the wishlist API)
  D2     → B9 (search needs the search API)
  D3     → B7 (tracking needs the tracking API)
  D4     → C4 (multi-image form needs the image API)
  E1     → B6 (coupon applies at checkout)

  Can run in PARALLEL safely:
    B-steps (user shop)  ‖  C1-C3 (admin verification)
    D-steps (API gaps)   ‖  B8-B9 wiring (after D lands)
    E-steps (advanced)   one at a time, independent of each other

════════════════════════════════════════════════════════════════════
  SUMMARY (plain language)
════════════════════════════════════════════════════════════════════

  • The USER shop is the biggest job: listing, detail, reviews, cart,
    checkout, orders, wishlist, search. Most of it is re-binding hard-coded
    sample data to live API calls — the templates are already built.
  • The ADMIN panel is ~90% done; we mostly verify it and finish the
    dashboard, orders, product images, and review moderation.
  • We also WRITE several new API features the backend doesn't have yet:
    wishlist, search, order tracking, multi-image upload, related products,
    then coupons, banners, audit log, bulk import.
  • Shared foundation (base URLs, endpoint fixes, auth interceptor) is
    one task that unlocks everything else — do it first.
