'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Title, TextInput, Text, Stack, Anchor, Paper } from '@mantine/core';
import Link from 'next/link';
import classes from './search.module.css';

const LOAD_TIMEOUT = 10;

interface PFResult {
  url: string;
  meta: { title?: string };
  excerpt: string;
}

function toHref(url: string): string {
  // Strip .html extension (pagefind records static file paths)
  // Strip any basePath prefix if present (future-proof)
  return url.replace(/\.html$/, '');
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PFResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(LOAD_TIMEOUT);
  const [timedOut, setTimedOut] = useState(false);
  // @ts-ignore
  const pf = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const origin = window.location.origin;
        // @ts-ignore
        pf.current = await import(/* webpackIgnore: true */ `${origin}/pagefind/pagefind.js`);
        // @ts-ignore
        await pf.current.init();
        setReady(true);
      } catch {
        setTimedOut(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (ready || timedOut) return;
    if (countdown <= 0) { setTimedOut(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, ready, timedOut]);

  const runSearch = useCallback(async (q: string) => {
    if (!pf.current || !q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      // @ts-ignore
      const result = await pf.current.search(q);
      const data: PFResult[] = await Promise.all(
        // @ts-ignore
        result.results.slice(0, 15).map((r) => r.data())
      );
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  return (
    <Container size="md" maw="928px" py="xl">
      <Title order={1} mb="lg">Search</Title>

      <TextInput
        size="md"
        placeholder={ready ? 'Search articles…' : 'Loading…'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={!ready}
        autoFocus
        mb="md"
      />

      {!ready && !timedOut && (
        <Text c="dimmed" size="sm">Loading search… {countdown}</Text>
      )}
      {timedOut && !ready && (
        <Text c="dimmed" size="sm">Search is not available.</Text>
      )}
      {ready && loading && (
        <Text c="dimmed" size="sm">Searching…</Text>
      )}
      {ready && !loading && query.trim() && results.length === 0 && (
        <Text c="dimmed" size="sm">No results for &ldquo;{query}&rdquo;</Text>
      )}

      <Stack gap="sm" mt="md">
        {results.map((r) => (
          <Paper key={r.url} shadow="xs" p="md" withBorder component={Link} href={toHref(r.url)} className={classes.result}>
            <Title order={3} size="h4" mb={4}>{r.meta.title ?? 'Article'}</Title>
            <Text
              size="sm"
              c="dimmed"
              className={classes.excerpt}
              dangerouslySetInnerHTML={{ __html: r.excerpt }}
            />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
