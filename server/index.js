import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const TEBEX_TOKEN = process.env.VITE_TEBEX_PUBLIC_TOKEN;
const TEBEX_PRIVATE_KEY = process.env.TEBEX_PRIVATE_KEY;
const API_BASE = 'https://headless.tebex.io/api';

if (!TEBEX_TOKEN || !TEBEX_PRIVATE_KEY) {
  console.error('ERROR: Missing Tebex credentials. Set VITE_TEBEX_PUBLIC_TOKEN and TEBEX_PRIVATE_KEY in .env');
  process.exit(1);
}

const auth = Buffer.from(`${TEBEX_TOKEN}:${TEBEX_PRIVATE_KEY}`).toString('base64');

// Get client IP (required when creating basket from backend)
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip && !ip.includes(':')) return ip; // IPv4 only
  }
  const ip = req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  if (ip && ip.includes(':')) return '127.0.0.1'; // IPv6 not supported, fallback
  return ip || '127.0.0.1';
}

app.post('/api/checkout', async (req, res) => {
  try {
    const { packageId, returnUrl, basketIdent: existingBasketIdent, goToCheckout } = req.body;
    if (!packageId) {
      return res.status(400).json({ error: 'packageId is required' });
    }

    const baseUrl = returnUrl || (req.headers.origin || `${req.protocol}://${req.get('host')}`);
    const completeUrl = `${baseUrl}/thank-you`;
    const cancelUrl = baseUrl;
    const clientIp = getClientIp(req);

    let basketIdent = existingBasketIdent;

    if (!basketIdent) {
      const basketPayload = {
        complete_url: completeUrl,
        cancel_url: cancelUrl,
        complete_auto_redirect: true,
        ip_address: clientIp,
      };

      const basketRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basketPayload),
      });

      if (!basketRes.ok) {
        const errText = await basketRes.text();
        let errMsg = 'Failed to create basket';
        try {
          const errJson = JSON.parse(errText);
          if (errJson.detail) errMsg = errJson.detail;
          else if (errJson.message) errMsg = errJson.message;
        } catch (_) {
          if (errText) errMsg = errText.slice(0, 200);
        }
        console.error('[CHECKOUT] Basket creation failed:', basketRes.status, errText);
        return res.status(500).json({ error: errMsg });
      }

      const basketData = await basketRes.json();
      basketIdent = basketData.data?.ident;

      if (!basketIdent) {
        return res.status(500).json({ error: 'Invalid basket response' });
      }
    }

    const addRes = await fetch(`${API_BASE}/baskets/${basketIdent}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ package_id: String(packageId), quantity: 1 }),
    });

    if (!addRes.ok) {
      const errText = await addRes.text();
      const needsAuth = /login|auth|sign.?in/i.test(errText);
      if (needsAuth) {
        const callbackUrl = `${baseUrl}/auth-callback?basketIdent=${encodeURIComponent(basketIdent)}&packageId=${encodeURIComponent(packageId)}&goToCheckout=${goToCheckout ? '1' : '0'}`;
        const authRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets/${basketIdent}/auth?returnUrl=${encodeURIComponent(callbackUrl)}`, {
          headers: { 'Authorization': `Basic ${auth}` },
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          const authOptions = Array.isArray(authData) ? authData : authData.data || authData.auth || [];
          const authUrl = authOptions[0]?.url || authOptions[0];
          if (authUrl) {
            return res.json({ authRequired: true, authUrl, basketIdent });
          }
        }
      }
      let errMsg = 'Failed to add package to basket';
      try {
        const errJson = JSON.parse(errText);
        if (errJson.detail) errMsg = errJson.detail;
        else if (errJson.message) errMsg = errJson.message;
      } catch (_) {
        if (errText) errMsg = errText.slice(0, 200);
      }
      console.error('[CHECKOUT] Add package failed:', addRes.status, 'packageId=', packageId, errText);
      return res.status(500).json({ error: errMsg });
    }

    const finalBasket = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets/${basketIdent}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    const finalData = await finalBasket.json();
    const checkoutUrl = finalData.data?.links?.checkout;

    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Could not get checkout URL' });
    }

    res.json({ checkoutUrl, basketIdent });
  } catch (err) {
    console.error('[CHECKOUT] Error:', err);
    res.status(500).json({ error: err.message || 'Checkout failed' });
  }
});

app.post('/api/checkout/continue', async (req, res) => {
  try {
    const { basketIdent, packageId } = req.body;
    if (!basketIdent || !packageId) {
      return res.status(400).json({ error: 'basketIdent and packageId required' });
    }
    const addRes = await fetch(`${API_BASE}/baskets/${basketIdent}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ package_id: String(packageId), quantity: 1 }),
    });
    if (!addRes.ok) {
      const errText = await addRes.text();
      let errMsg = 'Failed to add package';
      try {
        const errJson = JSON.parse(errText);
        if (errJson.detail) errMsg = errJson.detail;
      } catch (_) {
        if (errText) errMsg = errText.slice(0, 150);
      }
      return res.status(500).json({ error: errMsg });
    }
    const basketRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets/${basketIdent}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    const basketData = await basketRes.json();
    const checkoutUrl = (basketData.data || basketData)?.links?.checkout;
    if (!checkoutUrl) return res.status(500).json({ error: 'Could not get checkout URL' });
    res.json({ checkoutUrl, basketIdent });
  } catch (err) {
    console.error('[CHECKOUT] Continue error:', err);
    res.status(500).json({ error: err.message || 'Checkout failed' });
  }
});

app.get('/api/basket/:ident', async (req, res) => {
  try {
    const { ident } = req.params;
    const basketRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets/${ident}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (!basketRes.ok) return res.status(404).json({ error: 'Basket not found' });
    const json = await basketRes.json();
    const basket = json.data || json;

    // Enrich basket packages with names (Tebex may not include them)
    const packages = basket.packages || [];
    if (packages.length > 0) {
      const catsRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/categories?includePackages=1`, {
        headers: { 'Authorization': `Basic ${auth}` },
      });
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        const cats = catsData.data || catsData;
        const nameMap = {};
        for (const c of cats || []) {
          for (const p of c.packages || []) {
            if (p.id) nameMap[String(p.id)] = p.name;
          }
        }
        basket.packages = packages.map(p => {
          const pkgId = p.package?.id ?? p.package_id ?? p.id;
          const name = p.package?.name ?? p.name ?? (pkgId ? nameMap[String(pkgId)] : null);
          return { ...p, package: { ...(p.package || {}), id: pkgId, name: name || 'Package' } };
        });
      }
    }

    res.json(basket);
  } catch (err) {
    console.error('Basket fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch basket' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, configured: !!(TEBEX_TOKEN && TEBEX_PRIVATE_KEY) });
});

// Debug: test Tebex basket creation
app.get('/api/debug-tebex', async (req, res) => {
  try {
    const basketRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        complete_url: 'http://localhost:5173/thank-you',
        cancel_url: 'http://localhost:5173',
        complete_auto_redirect: true,
        ip_address: '127.0.0.1',
      }),
    });
    const text = await basketRes.text();
    res.json({ status: basketRes.status, ok: basketRes.ok, body: text.slice(0, 500) });
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

// Debug: test adding package to basket (?packageId=6751951)
app.get('/api/debug-add-package', async (req, res) => {
  const packageId = req.query.packageId || '6751951';
  try {
    const basketRes = await fetch(`${API_BASE}/accounts/${TEBEX_TOKEN}/baskets`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        complete_url: 'http://localhost:5173/thank-you',
        cancel_url: 'http://localhost:5173',
        complete_auto_redirect: true,
        ip_address: '127.0.0.1',
      }),
    });
    if (!basketRes.ok) {
      return res.json({ step: 'basket', status: basketRes.status, body: await basketRes.text() });
    }
    const { data } = await basketRes.json();
    const basketIdent = data?.ident;
    if (!basketIdent) return res.json({ error: 'No basket ident' });

    const addRes = await fetch(`${API_BASE}/baskets/${basketIdent}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ package_id: String(packageId), quantity: 1 }),
    });
    const addText = await addRes.text();
    res.json({
      step: 'add-package',
      status: addRes.status,
      ok: addRes.ok,
      body: addText.slice(0, 600),
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Checkout API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Kill the other process or set PORT=3002 in .env`);
    console.error('To kill: npx kill-port 3001  (or close the other terminal)\n');
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
