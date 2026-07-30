# Markdown for Agents - Implementation Guide

## What It Does
Cloudflare's Markdown for Agents automatically converts HTML pages to Markdown when AI agents request content with `Accept: text/markdown` header.

**Score Impact**: +8-10 points (Content: 1/1 instead of 0/1)  
**New Score**: ~50-55/100 (Level 3: Agent-Friendly)

---

## Requirements

### Plan Requirements
- ✅ Pro, Business, or Enterprise Cloudflare plan
- ✅ SSL for SaaS customers also eligible
- ✅ **No additional cost**

### Technical Requirements
- ✅ HTML content (already have this)
- ✅ Pages under 2 MB (articles are well under this)
- ✅ Custom domain on Cloudflare (already configured)

---

## How to Enable

### Option 1: Cloudflare Dashboard (Recommended)

1. **Log into Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com/

2. **Select Zone**
   - Choose `mahdalova-skop.cz`
   - Repeat for `datajournalism.studio`

3. **Navigate to AI Crawl Control**
   - Dashboard → Your Zone → AI Crawl Control
   - Direct URL: `https://dash.cloudflare.com/?to=/:account/:zone/ai`

4. **Enable Markdown for Agents**
   - Toggle the switch to ON
   - No other configuration needed

5. **Verify**
   ```bash
   curl https://www.mahdalova-skop.cz/ -H "Accept: text/markdown"
   ```
   Should return `Content-Type: text/markdown`

### Option 2: Cloudflare API

```bash
# Get zone ID
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"

# Enable Markdown for Agents
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/ZONE_ID/settings/markdown_for_agents" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"on"}'
```

---

## How It Works

### For Browsers (Normal Users)
```bash
curl https://www.mahdalova-skop.cz/
# Returns: Content-Type: text/html
```

### For AI Agents
```bash
curl https://www.mahdalova-skop.cz/ -H "Accept: text/markdown"
# Returns: Content-Type: text/markdown
# Also includes: x-markdown-tokens header (token count)
```

### Content Negotiation
- Cloudflare detects `Accept: text/markdown` header
- Converts HTML to clean Markdown at the edge
- Returns with proper `Content-Type: text/markdown`
- Adds `x-markdown-tokens` header with token count

---

## What Gets Converted

### Included
- ✅ Article text content
- ✅ Headings (H1-H6)
- ✅ Paragraphs
- ✅ Lists (ordered/unordered)
- ✅ Links
- ✅ Images (as markdown image syntax)
- ✅ Code blocks
- ✅ Tables
- ✅ Blockquotes

### Excluded (Stripped)
- ❌ Navigation menus
- ❌ Sidebars
- ❌ Footers
- ❌ JavaScript
- ❌ CSS
- ❌ Ads
- ❌ Analytics scripts

**Result**: Clean, structured markdown perfect for AI consumption

---

## Testing

### Test Command
```bash
# mahdalova-skop.cz
curl https://www.mahdalova-skop.cz/clanek/analyza-2026-04-02-kdo-vydelava-na-drahem-benzinu \
  -H "Accept: text/markdown" \
  -v

# datajournalism.studio
curl https://www.datajournalism.studio/a/unique-election-model \
  -H "Accept: text/markdown" \
  -v
```

### Expected Response Headers
```
HTTP/2 200
content-type: text/markdown
x-markdown-tokens: 1234
```

### Verify with isitagentready.com
After enabling, test at:
- https://isitagentready.com/www.mahdalova-skop.cz
- https://isitagentready.com/www.datajournalism.studio

Should show:
- ✅ Content: 1/1 (Markdown Negotiation supported)
- Score increase to ~50-55/100

---

## Benefits

### For AI Agents
- **Faster processing**: Markdown is 50-70% smaller than HTML
- **Better understanding**: Structured format is easier to parse
- **Token efficiency**: Fewer tokens needed for same content
- **Cleaner context**: No navigation/UI clutter

### For Your Sites
- **Better citations**: AI agents can more easily cite your content
- **Improved discovery**: Agents prefer markdown-enabled sites
- **Higher quality**: Better structured data = better AI responses
- **No maintenance**: Cloudflare handles conversion automatically

---

## Limitations

1. **Plan Requirement**: Needs Pro/Business/Enterprise plan
2. **Size Limit**: Pages must be under 2 MB (not an issue for articles)
3. **HTML Only**: Only converts HTML (not PDFs, etc.)
4. **Edge Conversion**: Slight processing overhead (negligible)

---

## Troubleshooting

### Issue: Still returns text/html
**Solutions**:
1. Verify feature is enabled in dashboard
2. Check you're on Pro/Business/Enterprise plan
3. Clear Cloudflare cache
4. Contact Cloudflare Support

### Issue: Conversion quality poor
**Solutions**:
1. Ensure HTML is semantic (use proper heading tags)
2. Avoid complex nested structures
3. Use standard HTML elements

### Issue: Missing content
**Solutions**:
1. Check if content is in `<main>` or `<article>` tags
2. Avoid hiding content in JavaScript
3. Use server-side rendering (already doing this)

---

## Cost

**FREE** - No additional cost on Pro/Business/Enterprise plans

---

## Action Items

### Immediate (5 minutes)
1. [ ] Check Cloudflare plan tier for both domains
2. [ ] Enable Markdown for Agents in dashboard for mahdalova-skop.cz
3. [ ] Enable Markdown for Agents in dashboard for datajournalism.studio
4. [ ] Test with curl command

### Verification (5 minutes)
1. [ ] Verify response headers include `Content-Type: text/markdown`
2. [ ] Check `x-markdown-tokens` header is present
3. [ ] Review markdown output quality
4. [ ] Test multiple article pages

### Final Testing (5 minutes)
1. [ ] Retest at isitagentready.com
2. [ ] Verify Content score is now 1/1
3. [ ] Confirm overall score increased to ~50-55/100

**Total Time**: ~15 minutes

---

## Expected Score After Enabling

### Current: 42/100
- Discoverability: 3/3 ✅
- Content: 0/1 ❌
- Bot Access Control: 2/2 ✅
- API/Auth/MCP: 1/6 ⚠️

### After Markdown for Agents: ~50-55/100
- Discoverability: 3/3 ✅
- Content: 1/1 ✅
- Bot Access Control: 2/2 ✅
- API/Auth/MCP: 1/6 ⚠️

**Level**: 3 - Agent-Friendly

---

## References

- [Cloudflare Docs](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Announcement Blog](https://blog.cloudflare.com/markdown-for-agents/)
- [Test Example](https://blog.cloudflare.com/markdown-for-agents/) (try with `Accept: text/markdown`)
