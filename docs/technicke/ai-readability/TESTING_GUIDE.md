# AI Readability Testing Guide

## Quick Validation Checklist

### ✅ Files Created

**mahdalova-skop.cz (apps/web)**
- [x] `public/robots.txt` - Content Signals and AI bot rules
- [x] `public/llms.txt` - Curated content index
- [x] `public/sitemap.xml` - Generated sitemap (73 articles)
- [x] `components/seo/ArticleJsonLd.tsx` - Schema.org component
- [x] `middleware.ts` - HTTP Link headers
- [x] `scripts/generateSitemap.js` - Sitemap generator

**datajournalism.studio (apps/datajournalism.studio)**
- [x] `public/robots.txt` - Content Signals and AI bot rules
- [x] `public/llms.txt` - Curated content index
- [x] `public/sitemap.xml` - Generated sitemap (28 articles)
- [x] `components/seo/ArticleJsonLd.tsx` - Schema.org component
- [x] `middleware.ts` - HTTP Link headers
- [x] `scripts/generateSitemap.js` - Sitemap generator

---

## Local Testing

### 1. Build and Test Locally

```bash
# Test mahdalova-skop.cz
cd apps/web
npm run build
npm run start
# Visit: http://localhost:3000

# Test datajournalism.studio
cd apps/datajournalism.studio
npm run build
npm run start
# Visit: http://localhost:3000
```

### 2. Verify Static Files

```bash
# Check robots.txt
curl http://localhost:3000/robots.txt

# Check llms.txt
curl http://localhost:3000/llms.txt

# Check sitemap.xml
curl http://localhost:3000/sitemap.xml
```

### 3. Test Schema.org JSON-LD

1. Visit any article page locally
2. View page source (Ctrl+U / Cmd+U)
3. Search for `application/ld+json`
4. Copy the JSON-LD script content
5. Paste into: https://validator.schema.org/
6. Verify no errors

**Test URLs:**
- mahdalova-skop.cz: `http://localhost:3000/clanek/analyza-2026-04-02-kdo-vydelava-na-drahem-benzinu`
- datajournalism.studio: `http://localhost:3000/a/unique-election-model`

### 4. Check HTTP Headers (After Deployment)

```bash
# mahdalova-skop.cz
curl -I https://www.mahdalova-skop.cz/

# datajournalism.studio
curl -I https://www.datajournalism.studio/

# Look for:
# Link: </llms.txt>; rel="llms-txt", </sitemap.xml>; rel="sitemap", </robots.txt>; rel="robots"
```

---

## Validation Tools

### Schema.org Validator
**URL:** https://validator.schema.org/

**What to check:**
- No errors in JSON-LD
- All required fields present:
  - `@context`: "https://schema.org"
  - `@type`: "Article"
  - `headline`
  - `author`
  - `datePublished`
  - `dateModified`
  - `image`
  - `publisher`

### Agent-Ready Score
**URL:** https://isitagentready.com/

**Test both sites:**
1. Enter: `https://www.mahdalova-skop.cz`
2. Enter: `https://www.datajournalism.studio`

**Target Score:** 80%+

**What it checks:**
- Discoverability (robots.txt, llms.txt, sitemap)
- Content accessibility
- Bot access control
- Protocol discovery

### Robots.txt Validator
**URL:** https://www.google.com/webmasters/tools/robots-testing-tool

**Or manually check:**
```bash
# Verify Content-Signal directive
grep "Content-Signal" apps/web/public/robots.txt
grep "Content-Signal" apps/datajournalism.studio/public/robots.txt

# Verify AI bot user-agents
grep -E "GPTBot|ClaudeBot|PerplexityBot" apps/web/public/robots.txt
```

### llms.txt Format Check
```bash
# Should be valid markdown
cat apps/web/public/llms.txt
cat apps/datajournalism.studio/public/llms.txt

# Check structure:
# - H1 with site name
# - Blockquote with description
# - Sections with links
```

---

## Production Testing (After Deployment)

### 1. robots.txt
```bash
curl https://www.mahdalova-skop.cz/robots.txt
curl https://www.datajournalism.studio/robots.txt
```

**Verify:**
- Content-Signal directive present
- AI bot user-agents listed
- Sitemap reference correct

### 2. llms.txt
```bash
curl https://www.mahdalova-skop.cz/llms.txt
curl https://www.datajournalism.studio/llms.txt
```

**Verify:**
- Valid markdown format
- All links absolute URLs
- Curated content list present

### 3. sitemap.xml
```bash
curl https://www.mahdalova-skop.cz/sitemap.xml
curl https://www.datajournalism.studio/sitemap.xml
```

**Verify:**
- Valid XML format
- All articles included
- lastmod dates present
- Absolute URLs

### 4. Schema.org on Live Articles

**mahdalova-skop.cz:**
```
https://www.mahdalova-skop.cz/clanek/analyza-2026-04-02-kdo-vydelava-na-drahem-benzinu
```

**datajournalism.studio:**
```
https://www.datajournalism.studio/a/unique-election-model
```

1. View source
2. Find `<script type="application/ld+json">`
3. Validate at validator.schema.org

### 5. HTTP Link Headers
```bash
curl -I https://www.mahdalova-skop.cz/ | grep -i "link:"
curl -I https://www.datajournalism.studio/ | grep -i "link:"
```

**Expected output:**
```
Link: </llms.txt>; rel="llms-txt", </sitemap.xml>; rel="sitemap", </robots.txt>; rel="robots"
```

---

## Manual Testing Checklist

### robots.txt
- [ ] File accessible at `/robots.txt`
- [ ] Contains `Content-Signal: search=yes, ai-input=yes, ai-train=yes`
- [ ] Lists AI bot user-agents (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
- [ ] References sitemap: `Sitemap: https://[domain]/sitemap.xml`
- [ ] Allow/Disallow rules correct

### Schema.org JSON-LD
- [ ] Present in article `<head>` section
- [ ] Valid JSON syntax
- [ ] All required fields populated
- [ ] Passes validator.schema.org
- [ ] Image URLs are absolute
- [ ] Dates in ISO 8601 format
- [ ] Author information present
- [ ] Publisher information present

### llms.txt
- [ ] Accessible at `/llms.txt`
- [ ] Valid markdown format
- [ ] H1 with site name
- [ ] Blockquote with description
- [ ] Curated list of sections
- [ ] Curated list of key articles
- [ ] All links are absolute URLs
- [ ] Contact information present

### sitemap.xml
- [ ] Accessible at `/sitemap.xml`
- [ ] Valid XML format
- [ ] All articles included
- [ ] Homepage included
- [ ] Main sections included
- [ ] lastmod dates present
- [ ] Absolute URLs
- [ ] Priority values set
- [ ] changefreq values set

### HTTP Link Headers
- [ ] Link headers present in response
- [ ] `rel="llms-txt"` present
- [ ] `rel="sitemap"` present
- [ ] Absolute URLs in Link headers

---

## Common Issues & Solutions

### Issue: Sitemap not updating
**Solution:** Run `node scripts/generateSitemap.js` manually or rebuild

### Issue: Schema.org validation errors
**Solution:** Check date format (must be ISO 8601), ensure all URLs are absolute

### Issue: Link headers not appearing
**Solution:** 
- For static export: Headers may not work in dev mode, test after build
- Check middleware.ts is in the correct location
- Verify hosting platform supports custom headers

### Issue: llms.txt returns 404
**Solution:** Ensure file is in `public/` directory and rebuild

---

## Success Metrics

### Immediate (After Implementation)
- ✅ All files accessible
- ✅ Schema.org validation passes
- ✅ No console errors
- ✅ Sitemap includes all articles

### Short-term (1-2 weeks)
- AI bot traffic in server logs (GPTBot, ClaudeBot, etc.)
- Agent-ready score > 80%
- No crawl errors in logs

### Long-term (1-3 months)
- Citations in AI search results (ChatGPT, Perplexity)
- Increased brand search volume
- AI bot crawl frequency

---

## Monitoring AI Bot Traffic

After deployment, monitor server logs for these user-agents:
- `GPTBot` (OpenAI)
- `ClaudeBot` (Anthropic)
- `PerplexityBot` (Perplexity)
- `Google-Extended` (Google AI)
- `Anthropic-AI` (Anthropic)
- `Applebot-Extended` (Apple)

Example log query:
```bash
grep -E "GPTBot|ClaudeBot|PerplexityBot|Google-Extended" access.log
```

---

## Next Steps After Testing

1. **If all tests pass:**
   - Merge feature branch to main
   - Deploy to production
   - Monitor AI bot traffic
   - Test with isitagentready.com after deployment

2. **If issues found:**
   - Document issues in this file
   - Fix and retest
   - Commit fixes to feature branch

3. **Future enhancements:**
   - Create llms-full.txt for RAG indexing
   - Add API catalog (/.well-known/api-catalog)
   - Consider MCP server for agent interactions
   - Optimize content structure for citability
