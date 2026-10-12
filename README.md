# NordFresh — Responsive Grocery Store Frontend

This static, responsive customer-facing demo includes **4 HTML pages**:

- `index.html` — Home
- `shop.html` — Shop (multi-select categories, search, price range, sorting, pagination, wishlist)
- `product.html` — Product Details (approved Option 2 layout, photo gallery, pack sizes, quantity, tabs, related products)
- `cart.html` — Shopping Cart (reference-inspired layout, quantity controls, coupon demo, order summary, recommendations)

## How to view

Extract the ZIP without changing the directory structure. Open `index.html` in Chrome, Firefox or Edge. All local assets are included; Nunito Sans is loaded from Google Fonts when an internet connection is available, with a fallback font otherwise. Use the product images/links and **View Full Cart** in the cart drawer to move between the pages.

## Final refinement changes

- Preserved the existing NordFresh green-and-white design system.
- Made Shop category filtering multi-select. Selected categories combine with search, price and preference filters; filters are reflected in the URL when allowed by the browser.
- Matched the price-slider label to its actual `Rs. 0–2,000+` range, and hardened malformed filter URL handling.
- Escaped user-entered search terms inserted into active filter chips.
- Corrected misleading product-image mappings: 11 products use distinctive **lightweight SVG demo illustrations** instead of photos of an unrelated product. These illustrations are not product photography and should be replaced before launch.
- Corrected the Royal Gala apple record and maintained six related products on Product Details.
- Changed Product Details key benefits and Storage Tips to match the selected product/category; no unverified numerical nutrition claims.
- Nutrition Facts tells users to check the original package label; household products show Product Information.
- Enabled Write a review to reveal the reviews tab, which remains a non-submittable frontend demo.
- Kept image selection, zoom, dynamic pack/quantity totals, local cart and wishlist.
- Added a fourth HTML page, `cart.html`, matching the existing NordFresh theme and using the shared local demo cart.

## Verification

Automated Chromium checks across **320px, 390px, 768px, and 1440px** on the original three pages found:

- No horizontal overflow
- No computed font sizes below 12px
- No uncaught JavaScript errors
- No broken loaded images

Interactions tested: category multi-select/reset (desktop and mobile), price filter, sorting, wishlist, cart, variant/quantity totals, galleries, tabs, and six related products.

## Cart page

The Cart page uses demo pricing, sample delivery charges, and frontend-only coupon codes. `FRESH80`, `NORD50` and `WELCOME` demonstrate coupon behaviour; no real coupon validation or checkout/payment is implemented. When no cart storage entry exists, the page initialises with a demo basket for visual evaluation. Use **Clear Cart** to remove all items; the empty basket then persists.

## Demo limitations

Product names, prices, stock, ratings, promotions and delivery claims are **illustrative**, not real-time or independently verified. Account, checkout, tracking, user-submitted reviews, subscriptions and social links are placeholders; no purchases or payments are performed. LocalStorage availability depends on the browser's privacy/file permissions. Replace demo illustration assets with licensed real product photography, connect backend endpoints, and validate product claims before publishing a commercial store.

## Cart layout update (reference-matched)

- `cart.html`, `cart.css`, and `cart.js` implement the approved reference layout with shared NordFresh header/footer unchanged.
- `assets/cart-delivery-truck.svg` provides a lightweight delivery illustration.
- The Cart reads the existing `nordfresh-demo-cart` localStorage key; it never inserts sample orders automatically.
- Product prices and free delivery (Rs. 2,000 threshold) use the shared catalog demo data. Coupons FRESH80/NORD50/WELCOME are frontend demo only.
- Checkout remains a placeholder and does not process orders or payment.

### Checkout Page — Bangladesh frontend demo

Open `checkout.html` after adding products to Cart. Cart's **Proceed to Checkout** opens the new page. The checkout uses the same header, footer and NordFresh green-white design, with new `checkout.css` and `checkout.js` only.

- Required delivery fields: full name, Bangladesh mobile, division, district, thana/upazila and full address; optional email and order comment.
- Cascading location selects: 8 divisions, 64 districts and upazilas (source: https://github.com/nuhil/bangladesh-geocode , MIT license), with a curated list of Dhaka metropolitan thanas.
- Demo shipping: Tk 70 for Dhaka City metropolitan thanas selected under Dhaka district, Tk 130 for other selections. For a production shop, validate city-corporation coverage/fees using a verified delivery zone table; a thana name alone does not guarantee eligibility for every address.
- Payment choices: Mobile Banking, Visa/Mastercard and Cash on Delivery. These controls DO NOT connect to a payment provider or collect card/payment details.
- Order Summary uses the shared localStorage cart. Original prices are shown as subtotal, product savings deducted exactly once; shipping added when an area is selected. Shipping rates override the older demo free-delivery messages still present elsewhere and those legacy messages should be aligned before going live.
- **Place Order** validates the form and displays a preview-only status. No real order is placed, no number/receipt generated, and no personal data is sent or persisted by this page.

### Checkout refinement (October 2026)

- The original-price total is labelled **Items Total (Before Discount)** to distinguish it from the discounted product total. Product Discount is deducted once; delivery is added separately.
- Full Address is a full-width, multi-line text area for house, road, area and landmark.
- Payment methods use lightweight local SVG icons instead of platform-dependent emojis. The payment options remain demo only.
- Left Delivery Policy contains the Tk 70 / Tk 130 rules once; the right-side card shows only the customer's selected delivery area and its current fee.
- Tested five browser viewport widths (320, 390, 768, 1055, 1440px) with no horizontal overflow or JavaScript errors, and checked required fields, valid/invalid Bangladeshi phone, the cascade reset, Dhaka City/Savar/Gazipur charges, and changing/empty carts.
- The Dhaka City eligibility lookup is a **demo approximation**, not a verified city corporation boundary database. Replace it with a validated deliverable-area table before use for actual customer orders.


## Added page
- `order-success.html` — Order confirmation / success page linked from checkout.

**Demo limitation:** Order Success uses browser localStorage only. It does not create a real order, process mobile banking/card payments, send email/SMS, or provide real order tracking. The checkout flow clears the demo cart only after browser storage accepts the order.
