/* Fundraising support: display prices and real Payment Link mapping only.
   Paste Stripe links into data/work-services-config.js. No client-side payment processing. */
(() => {
  const config = window.WORK_SERVICES;
  if (!config) return;
  document.querySelectorAll('[data-plan-price]').forEach(el => {
    const price = config.prices[el.dataset.planPrice];
    if (Number.isFinite(price)) el.textContent = '$' + price;
  });
  const notice = document.getElementById('checkout-notice');
  document.querySelectorAll('[data-payment]').forEach(button => {
    button.addEventListener('click', () => {
      const link = config.paymentLinks[button.dataset.payment];
      if (link) {
        try {
          const url = new URL(link);
          if (url.protocol === 'https:' && url.hostname === 'buy.stripe.com') {
            window.location.assign(url.href);
            return;
          }
        } catch (_) { /* Missing or invalid checkout opens the notice below. */ }
      }
      if (notice && !notice.open) notice.showModal();
    });
  });
})();
