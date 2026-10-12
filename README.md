# NordFresh — Final-polished 3-page frontend

This static, responsive customer-facing demo includes **exactly 3 HTML pages**:

- `index.html` — Home
- `shop.html` — Shop (multi-select categories, search, price range, sorting, pagination, wishlist)
- `product.html` — Product Details (approved Option 2 layout, photo gallery, pack sizes, quantity, tabs, related products)

## How to view

Extract the ZIP without changing the directory structure. Open `index.html` in Chrome, Firefox or Edge. All local assets are included; Nunito Sans is loaded from Google Fonts when an internet connection is available, with a fallback font otherwise. Use the product images/links to move between the three pages.

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
- No additional HTML pages or design-demo files are included.

## Verification

Automated Chromium checks across **320px, 390px, 768px, and 1440px** on all three pages found:

- No horizontal overflow
- No computed font sizes below 12px
- No uncaught JavaScript errors
- No broken loaded images

Interactions tested: category multi-select/reset (desktop and mobile), price filter, sorting, wishlist, cart, variant/quantity totals, galleries, tabs, and six related products.

## Demo limitations

Product names, prices, stock, ratings, promotions and delivery claims are **illustrative**, not real-time or independently verified. Account, checkout, tracking, user-submitted reviews, subscriptions and social links are placeholders; no purchases or payments are performed. LocalStorage availability depends on the browser's privacy/file permissions. Replace demo illustration assets with licensed real product photography, connect backend endpoints, and validate product claims before publishing a commercial store.
