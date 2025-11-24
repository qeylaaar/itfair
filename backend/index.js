// index.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// --- INI DIA BAGIAN PENTINGNYA ---
// Memberitahu Express untuk menyajikan file statis
// (HTML, CSS, gambar, dll.) dari folder bernama 'public'
app.use(express.static('public'));
// ---------------------------------

// Kita HAPUS blok app.get('/') yang lama, karena
// express.static() akan otomatis melayani file 'index.html'
// saat seseorang mengunjungi rute utama ('/')

// Server tetap berjalan seperti biasa
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(helmet());
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_AUTH_URI = process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth';
const GOOGLE_TOKEN_URI = process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function requireAdmin(req, res, next) {
  const key = req.header('x-admin-key');
  if (!ADMIN_API_KEY || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

function buildGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${GOOGLE_AUTH_URI}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const resp = await fetch(GOOGLE_TOKEN_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to exchange code: ${resp.status} ${text}`);
  }

  return resp.json();
}

async function fetchGoogleUserInfo(accessToken) {
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch user info: ${resp.status} ${text}`);
  }

  return resp.json();
}

// --------- ML Proxy Endpoints (FastAPI) ---------

// Ambil daftar region dari layanan ML FastAPI
app.get('/api/ml/regions', async (req, res) => {
  try {
    const resp = await fetch('http://127.0.0.1:8001/regions');

    if (!resp.ok) {
      const detail = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({ error: 'ml_service_error', detail });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (e) {
    console.error('Error fetching ML regions:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Proxy prediksi gagal panen ke layanan ML FastAPI
app.post('/api/ml/predict', async (req, res) => {
  try {
    const { region, month, planting_month, use_csv } = req.body || {};

    if (!region) {
      return res.status(400).json({ error: 'region_required' });
    }

    // Build request body untuk FastAPI
    const requestBody = {
      region,
      use_csv: use_csv !== undefined ? use_csv : true,
    };

    // Jika ada planting_month, gunakan itu (prioritas lebih tinggi)
    if (planting_month !== undefined && planting_month !== null) {
      requestBody.planting_month = planting_month;
    } else if (month) {
      // Convert month (YYYY-MM) ke planting_month (1-12)
      const monthParts = month.split('-');
      if (monthParts.length === 2) {
        const monthNum = parseInt(monthParts[1], 10);
        if (monthNum >= 1 && monthNum <= 12) {
          requestBody.planting_month = monthNum;
        }
      }
    }

    const resp = await fetch('http://127.0.0.1:8001/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!resp.ok) {
      const detail = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({ error: 'ml_service_error', detail });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (e) {
    console.error('Error proxying ML predict:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Simple admin login: validate x-admin-key
app.post('/api/admin/login', (req, res) => {
  const key = req.header('x-admin-key');
  if (!ADMIN_API_KEY || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return res.json({ status: 'ok' });
});

app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!ADMIN_API_KEY) {
    return res.status(500).json({ error: 'admin_api_key_not_configured' });
  }

  if (!password || password !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const payload = {
    sub: 'admin',
    role: 'admin',
    username: username || 'admin',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  return res.json({ token, user: payload });
});

app.get('/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    return res.status(500).json({ error: 'google_oauth_not_configured' });
  }

  const url = buildGoogleAuthUrl();
  return res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: String(error) });
  }

  if (!code) {
    return res.status(400).json({ error: 'missing_code' });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    return res.status(500).json({ error: 'google_oauth_not_configured' });
  }

  try {
    const tokenResponse = await exchangeCodeForTokens(String(code));
    const accessToken = tokenResponse.access_token;

    if (!accessToken) {
      return res.status(500).json({ error: 'missing_access_token', details: tokenResponse });
    }

    const profile = await fetchGoogleUserInfo(accessToken);

    // Untuk saat ini kita hanya mengembalikan profil Google dan token mentahnya.
    // Nanti bisa ditambah logika untuk menyimpan user ke Supabase atau membuat JWT sendiri.
    return res.json({
      provider: 'google',
      tokens: tokenResponse,
      profile,
    });
  } catch (e) {
    console.error('Google OAuth callback error:', e);
    return res.status(500).json({ error: 'google_oauth_failed' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    if (!supabase) return res.json({ status: 'ok', supabase: 'not_configured' });
    const { error } = await supabase.from('observations').select('id', { count: 'exact', head: true });
    return res.json({ status: 'ok', supabase: error ? 'error' : 'ok' });
  } catch (e) {
    return res.status(500).json({ status: 'error' });
  }
});

app.post('/api/admin/datasets', requireAdmin, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'supabase_not_configured' });
  try {
    const payload = req.body;
    const rows = Array.isArray(payload) ? payload : [payload];
    if (!rows.length) return res.status(400).json({ error: 'empty_payload' });
    const { data, error } = await supabase.from('observations').insert(rows).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ inserted: data.length, data });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/predictions', async (req, res) => {
  try {
    const { region, limit } = req.query;
    const lim = Math.min(Number(limit) || 100, 500);

    // If Supabase not configured, return mock data
    if (!supabase) {
      const mock = [
        {
          id: 'mock-1',
          region: 'Kabupaten A',
          prediction_for_date: '2025-11-28',
          risk_level: 'high',
          failure_probability: 0.82,
          similarity_pct: 85,
          message: 'Perhatian, pola cuaca mirip kejadian gagal panen tahun lalu.' ,
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          region: 'Kabupaten B',
          prediction_for_date: '2025-11-27',
          risk_level: 'medium',
          failure_probability: 0.46,
          similarity_pct: 58,
          message: 'Risiko sedang, pantau irigasi dan kelembapan tanah.',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-3',
          region: 'Kabupaten C',
          prediction_for_date: '2025-11-26',
          risk_level: 'low',
          failure_probability: 0.18,
          similarity_pct: 22,
          message: 'Risiko rendah, kondisi relatif aman.',
          created_at: new Date().toISOString()
        }
      ];
      const filtered = region ? mock.filter(m => (m.region || '').toLowerCase().includes(String(region).toLowerCase())) : mock;
      const sliced = filtered.slice(0, lim);
      return res.json({ count: sliced.length, data: sliced, source: 'mock' });
    }

    // Normal path with Supabase
    let q = supabase.from('predictions').select('*').order('created_at', { ascending: false });
    if (region) q = q.eq('region', region);
    q = q.limit(lim);
    const { data, error } = await q;
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ count: data?.length || 0, data });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log('Server sekarang menyajikan file dari folder "public"!');
  console.log('Tekan Ctrl + C untuk menghentikan server.');
});