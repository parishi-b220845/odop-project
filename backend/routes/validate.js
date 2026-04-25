const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { pool } = require('../config/database');

// POST /api/validate/product
// AI validation of an ODOP product listing using Claude API
router.post('/product', authenticate, authorize('seller', 'admin'), async (req, res) => {
  const { name, description, category, state, district, odopProductName, price } = req.body;

  if (!name || !description || !category) {
    return res.status(400).json({ error: 'name, description, and category are required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful fallback: basic rule-based validation
    return res.json(ruleBasedValidation({ name, description, category, state, district, odopProductName, price }));
  }

  try {
    const prompt = `You are an expert validator for India's ODOP (One District One Product) marketplace.
Evaluate this product listing and give a structured JSON validation report.

Product Details:
- Name: ${name}
- Category: ${category}
- ODOP Product Type: ${odopProductName || 'Not specified'}
- State/District: ${state || 'Not specified'} / ${district || 'Not specified'}
- Price (INR): ${price || 'Not specified'}
- Description: ${description}

Return ONLY valid JSON with this structure:
{
  "score": <0-100 overall authenticity score>,
  "approved": <true if score >= 60>,
  "checks": {
    "odopMatch": { "pass": <bool>, "note": "<brief explanation>" },
    "descriptionQuality": { "pass": <bool>, "note": "<brief explanation>" },
    "priceReasonable": { "pass": <bool>, "note": "<brief explanation>" },
    "geographicConsistency": { "pass": <bool>, "note": "<brief explanation>" }
  },
  "suggestions": ["<improvement suggestion 1>", "<improvement suggestion 2>"],
  "summary": "<2 sentence plain English verdict>"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

    const aiData = await response.json();
    const text = aiData.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse AI response');

    const validation = JSON.parse(jsonMatch[0]);
    return res.json({ ...validation, source: 'ai' });

  } catch (err) {
    console.error('AI validation error:', err.message);
    // Fallback to rule-based
    return res.json({ ...ruleBasedValidation({ name, description, category, state, district, odopProductName, price }), source: 'rules' });
  }
});

function ruleBasedValidation({ name, description, category, state, district, odopProductName, price }) {
  const checks = {
    odopMatch: {
      pass: !!(odopProductName && odopProductName.trim().length > 3),
      note: odopProductName ? `Mapped to ODOP product: ${odopProductName}` : 'No ODOP product type specified',
    },
    descriptionQuality: {
      pass: description.length >= 80,
      note: description.length >= 80
        ? 'Description is detailed and informative'
        : `Description is too short (${description.length} chars). Aim for 80+ characters.`,
    },
    priceReasonable: {
      pass: price >= 100 && price <= 500000,
      note: price >= 100 ? 'Price looks reasonable for an artisan product' : 'Price seems too low for a handcrafted product',
    },
    geographicConsistency: {
      pass: !!(state && district),
      note: (state && district) ? `Product linked to ${district}, ${state}` : 'Please specify state and district for geographic authenticity',
    },
  };

  const passCount = Object.values(checks).filter(c => c.pass).length;
  const score = Math.round((passCount / 4) * 100);

  return {
    score,
    approved: score >= 60,
    checks,
    suggestions: [
      !checks.descriptionQuality.pass ? 'Write a more detailed description (80+ characters) explaining the craft, materials, and origin.' : null,
      !checks.odopMatch.pass ? 'Select the specific ODOP product type this belongs to.' : null,
      !checks.geographicConsistency.pass ? 'Add the state and district where this product originates.' : null,
    ].filter(Boolean),
    summary: score >= 60
      ? 'This product passes basic ODOP validation. A few improvements can increase its authenticity score.'
      : 'This product needs more information before it can be listed. Please address the issues above.',
    source: 'rules',
  };
}

module.exports = router;
