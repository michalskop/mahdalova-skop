# AI Readability Implementation Plan

## Overview
Implement GEO (Generative Engine Optimization) and Agent-Ready features to make both websites machine-readable for AI search engines and agents.

## Websites Covered
- **mahdalova-skop.cz** (`apps/web`) - Articles at `/clanek/[slug]`
- **datajournalism.studio** (`apps/datajournalism.studio`) - Articles at `/a/[slug]`

Both sites use Next.js 14 with static export and have identical architecture.

---

## Implementation Checklist

### Phase 1: Quick Wins (5-30 minutes each)

- [ ] **1.1 Content Signals in robots.txt - mahdalova-skop.cz**
  - Add `Content-Signal: search=yes, ai-input=yes, ai-train=yes`
  - Add explicit User-agent rules for AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
  - Ensure sitemap reference exists
  - Time: 5 minutes
  - File: `apps/web/public/robots.txt`

- [ ] **1.2 Content Signals in robots.txt - datajournalism.studio**
  - Same as 1.1 but for datajournalism.studio
  - Time: 5 minutes
  - File: `apps/datajournalism.studio/public/robots.txt`

### Phase 2: Structured Data (2 hours)

- [ ] **2.1 Implement Schema.org JSON-LD - mahdalova-skop.cz**
  - Add Article markup to each article page
  - Include: headline, author, datePublished, dateModified, description, image
  - Optional: Add Organization markup
  - File: `apps/web/app/clanek/[slug]/page.tsx`
  - Time: 1 hour

- [ ] **2.2 Implement Schema.org JSON-LD - datajournalism.studio**
  - Same as 2.1 but for datajournalism.studio
  - File: `apps/datajournalism.studio/app/a/[slug]/page.tsx`
  - Time: 30 minutes (copy & adapt from web)

- [ ] **2.3 Validate Schema.org Implementation**
  - Test both sites with validator.schema.org
  - Verify all required fields present

### Phase 3: Content Discovery (2-4 hours)

- [ ] **3.1 Create llms.txt - mahdalova-skop.cz**
  - Root-level markdown file
  - H1 with site name
  - Blockquote with description
  - Curated list of key sections and articles
  - File: `apps/web/public/llms.txt`
  - Time: 1 hour

- [ ] **3.2 Create llms.txt - datajournalism.studio**
  - Same structure as 3.1
  - File: `apps/datajournalism.studio/public/llms.txt`
  - Time: 1 hour

- [ ] **3.3 Create llms-full.txt (Optional) - mahdalova-skop.cz**
  - Full content export for RAG indexing
  - All articles in markdown format
  - File: `apps/web/public/llms-full.txt`
  - Time: 30 minutes

- [ ] **3.4 Create llms-full.txt (Optional) - datajournalism.studio**
  - Same as 3.3
  - File: `apps/datajournalism.studio/public/llms-full.txt`
  - Time: 30 minutes

- [ ] **3.5 Verify/Create sitemap.xml - mahdalova-skop.cz**
  - Ensure all articles included
  - Proper lastmod dates
  - File: `apps/web/public/sitemap.xml`
  - Time: 30 minutes (if not exists)

- [ ] **3.6 Verify/Create sitemap.xml - datajournalism.studio**
  - Same as 3.5
  - File: `apps/datajournalism.studio/public/sitemap.xml`
  - Time: 30 minutes (if not exists)

### Phase 4: HTTP Headers (1 hour)

- [ ] **4.1 Add Link Response Headers - mahdalova-skop.cz**
  - Advertise: llms-txt, sitemap, api-catalog (if applicable)
  - Implementation method depends on hosting:
    - Static export: Use Next.js middleware or headers config
    - Vercel: `vercel.json`
    - Cloudflare: `public/_headers`
  - Time: 30 minutes

- [ ] **4.2 Add Link Response Headers - datajournalism.studio**
  - Same as 4.1
  - Time: 30 minutes

### Phase 5: Content Optimization (Ongoing)

- [ ] **5.1 Review Article Structure**
  - First sentence of each section = standalone definition
  - Short, citeable paragraphs
  - Clear attribution near claims
  - Avoid content cannibalization

- [ ] **5.2 Add E-E-A-T Signals**
  - Author profiles with external links
  - Visible publication dates
  - Source citations

### Phase 6: Advanced (Optional - Future)

- [ ] **6.1 API Catalog**
  - Create `/.well-known/api-catalog`
  - RFC 9727 format
  - Time: 1-2 hours

- [ ] **6.2 MCP Server**
  - Only if agent interactions needed
  - Create `/.well-known/mcp/server-card.json`
  - Time: Half-day+

---

## Testing & Validation

### Automated Tests

#### 1. Schema.org Validation
```bash
# Test URL
https://validator.schema.org/

# Test local build - mahdalova-skop.cz
cd apps/web
npm run build
npm run start
# Then test: http://localhost:3000/clanek/[any-article-slug]

# Test local build - datajournalism.studio
cd apps/datajournalism.studio
npm run build
npm run start
# Then test: http://localhost:3000/a/[any-article-slug]
```

#### 2. Robots.txt Validation
```bash
# Check robots.txt is accessible - mahdalova-skop.cz
curl https://www.mahdalova-skop.cz/robots.txt
grep "Content-Signal" apps/web/public/robots.txt

# Check robots.txt is accessible - datajournalism.studio
curl https://www.datajournalism.studio/robots.txt
grep "Content-Signal" apps/datajournalism.studio/public/robots.txt
```

#### 3. llms.txt Validation
```bash
# Check llms.txt is accessible - mahdalova-skop.cz
curl https://www.mahdalova-skop.cz/llms.txt
cat apps/web/public/llms.txt

# Check llms.txt is accessible - datajournalism.studio
curl https://www.datajournalism.studio/llms.txt
cat apps/datajournalism.studio/public/llms.txt
```

#### 4. HTTP Headers Check
```bash
# Check Link headers - mahdalova-skop.cz
curl -I https://www.mahdalova-skop.cz/

# Check Link headers - datajournalism.studio
curl -I https://www.datajournalism.studio/

# Should include:
# Link: </llms.txt>; rel="llms-txt"
# Link: </sitemap.xml>; rel="sitemap"
```

#### 5. Agent-Ready Score
```bash
# Use isitagentready.com
# Visit: https://isitagentready.com/
# Test both sites:
# - https://www.mahdalova-skop.cz
# - https://www.datajournalism.studio
```

### Manual Validation Checklist

- [ ] **Robots.txt**
  - [ ] File exists at `/robots.txt`
  - [ ] Contains `Content-Signal` directive
  - [ ] Lists AI bot user-agents (GPTBot, ClaudeBot, etc.)
  - [ ] References sitemap

- [ ] **Schema.org JSON-LD**
  - [ ] Present in article `<head>`
  - [ ] Valid JSON syntax
  - [ ] All required fields populated
  - [ ] Passes validator.schema.org
  - [ ] Image URLs are absolute
  - [ ] Dates in ISO format

- [ ] **llms.txt**
  - [ ] Accessible at `/llms.txt`
  - [ ] Valid markdown format
  - [ ] Contains site description
  - [ ] Lists key sections/articles
  - [ ] Links are absolute URLs

- [ ] **Sitemap**
  - [ ] Accessible at `/sitemap.xml`
  - [ ] Valid XML format
  - [ ] All articles included
  - [ ] lastmod dates present

- [ ] **HTTP Headers**
  - [ ] Link headers present
  - [ ] Correct rel values
  - [ ] Absolute URLs

### Performance Metrics (Post-Implementation)

Track these over time to measure success:

#### 1. AI Bot Traffic
```bash
# Monitor server logs for:
- GPTBot
- ClaudeBot  
- PerplexityBot
- Google-Extended
- CCBot
```

#### 2. Citations in AI Responses
- Manual testing: Ask ChatGPT, Perplexity about your topics
- Check if your site is cited
- Track brand mentions

#### 3. Schema.org Coverage
```bash
# Count articles with Schema.org markup
grep -r "@type.*Article" apps/web/app/clanek/_articles/ | wc -l
```

#### 4. Agent-Ready Score
- Baseline score before implementation
- Score after each phase
- Target: 80%+ on isitagentready.com

---

## Testing Commands

### Local Development
```bash
# Start dev server - mahdalova-skop.cz (port 3001)
cd apps/web
npm run dev

# Start dev server - datajournalism.studio (port 3002)
cd apps/datajournalism.studio
npm run dev

# Build static site - mahdalova-skop.cz
cd apps/web
npm run build
npx serve out

# Build static site - datajournalism.studio
cd apps/datajournalism.studio
npm run build
npx serve out
```

### Validation Scripts
```bash
# mahdalova-skop.cz (port 3001 in dev, 3000 in production)
curl http://localhost:3001/robots.txt
curl http://localhost:3001/llms.txt
curl http://localhost:3001/sitemap.xml
# Visit: http://localhost:3001/clanek/[slug]

# datajournalism.studio (port 3002 in dev, 3000 in production)
curl http://localhost:3002/robots.txt
curl http://localhost:3002/llms.txt
curl http://localhost:3002/sitemap.xml
# Visit: http://localhost:3002/a/[slug]

# Validate Schema.org (after build)
# View source, copy JSON-LD
# Paste into: https://validator.schema.org/
```

### Production Testing
```bash
# After deployment, test live URLs - mahdalova-skop.cz
curl https://www.mahdalova-skop.cz/robots.txt
curl https://www.mahdalova-skop.cz/llms.txt
curl https://www.mahdalova-skop.cz/sitemap.xml
curl -I https://www.mahdalova-skop.cz/

# After deployment, test live URLs - datajournalism.studio
curl https://www.datajournalism.studio/robots.txt
curl https://www.datajournalism.studio/llms.txt
curl https://www.datajournalism.studio/sitemap.xml
curl -I https://www.datajournalism.studio/
```

---

## Success Criteria

### Minimum Viable Implementation (MVP)
- ✅ robots.txt with Content Signals
- ✅ Schema.org JSON-LD on all articles
- ✅ llms.txt with curated content
- ✅ sitemap.xml with all articles

### Full Implementation
- ✅ All MVP items
- ✅ HTTP Link headers
- ✅ llms-full.txt for RAG
- ✅ Agent-ready score > 80%
- ✅ Valid Schema.org on all pages

### Stretch Goals
- ✅ API catalog
- ✅ MCP server
- ✅ Markdown content negotiation
- ✅ E-E-A-T optimization

---

## Git Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/ai-readability

# Work in incremental commits
git add [files]
git commit -m "feat: add Content Signals to robots.txt"

# Push and create PR
git push origin feature/ai-readability
```

### Commit Message Convention
```
feat: add Schema.org JSON-LD to articles
feat: create llms.txt curator file
feat: add HTTP Link headers
fix: correct Schema.org date format
docs: update AI readability testing guide
```

---

## Rollback Plan

If issues arise:
1. Each feature is independent - can disable individually
2. robots.txt changes are non-breaking
3. Schema.org is additive - doesn't affect existing functionality
4. llms.txt is optional - can be removed
5. HTTP headers are optional - can be removed

---

## Resources

- [Schema.org Article](https://schema.org/Article)
- [Schema.org Validator](https://validator.schema.org/)
- [llms.txt Specification](https://llmstxt.org/)
- [Content Signals](https://contentsignals.org/)
- [Is It Agent Ready](https://isitagentready.com/)
- [RFC 8288 - Link Headers](https://www.rfc-editor.org/rfc/rfc8288)
- [RFC 9727 - API Catalog](https://www.rfc-editor.org/rfc/rfc9727)

---

## Timeline Estimate

### Per Site
- **Phase 1**: 10 minutes
- **Phase 2**: 1 hour
- **Phase 3**: 2 hours
- **Phase 4**: 30 minutes
- **Testing**: 30 minutes
- **Subtotal**: ~4 hours per site

### Both Sites (with reuse)
- **Phase 1**: 10 minutes (both sites)
- **Phase 2**: 1.5 hours (implement once, adapt for second)
- **Phase 3**: 2-4 hours (content differs between sites)
- **Phase 4**: 1 hour (both sites)
- **Testing**: 1 hour (both sites)

**Total**: ~6-8 hours for both sites
