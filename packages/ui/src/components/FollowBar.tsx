'use client';
import { Box, Button, Anchor, useMantineTheme } from '@mantine/core';

/**
 * FollowBar — DataTimes
 * Follow bar with all social media channels, placement: below article / above footer.
 *
 * Usage:
 *   import { FollowBar } from "@repo/ui/components/FollowBar";
 *   <FollowBar />
 *
 * TODO: Replace GOOGLE_NEWS_URL with your publication URL from Google News.
 * How to find it:
 *   1. Open news.google.com/search?q=site:datatimes.cz&hl=cs&gl=CZ&ceid=CZ:cs
 *   2. Click on the source name "DataTimes" (not an article)
 *   3. Copy the URL from the address bar (format: news.google.com/publications/CAAq...)
 */

const CHANNELS = [
  {
    label: "Google",
    url: "https://news.google.com/search?q=site%3Amahdalova-skop.cz&hl=cs&gl=CZ&ceid=CZ%3Acs",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="white" />
        <path d="M4 12C4 7.58 7.58 4 12 4v16C7.58 20 4 16.42 4 12z" fill="#34A853" />
        <path d="M12 4C16.42 4 20 7.58 20 12H12V4z" fill="#EA4335" />
        <path d="M20 12C20 16.42 16.42 20 12 20V12h8z" fill="#FBBC05" />
        <path d="M4 12C4 7.58 7.58 4 12 4C7.58 4 4 7.58 4 12z" fill="#4285F4" />
        <circle cx="12" cy="12" r="4" fill="white" />
      </svg>
    ),
  },
  {
    label: "Discord",
    url: "https://discord.gg/9WEF8PCD3w",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="#5865F2" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    url: "https://whatsapp.com/channel/0029VbBWey44IBhGI5IKm20Q",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366" />
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.659 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 0 1-4.054-1.107l-.29-.173-3.005.853.883-2.924-.19-.3A7.96 7.96 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" fill="#25D366" />
      </svg>
    ),
  },
  {
    label: "Spotify",
    url: "https://open.spotify.com/show/5xJhh6irxTHsp40qI5HoSO",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M17.25 16.5c-.19 0-.32-.06-.46-.15-2.3-1.4-5.18-1.72-8.58-.94-.19.04-.43.12-.57.12-.38 0-.67-.3-.67-.68 0-.42.25-.65.57-.72 3.79-.87 7.04-.5 9.67 1.09.28.16.45.36.45.68 0 .38-.28.6-.41.6zm1.18-2.78c-.23 0-.4-.09-.56-.19-2.63-1.57-6.64-2.03-9.76-1.11-.23.07-.37.14-.57.14-.44 0-.8-.35-.8-.8 0-.44.25-.73.62-.84 3.57-1.08 7.99-.56 11.02 1.27.3.18.5.43.5.82 0 .44-.36.71-.45.71zm.13-2.88c-.2 0-.35-.05-.54-.16C15.3 9.05 10.6 8.75 7.4 9.67c-.17.05-.38.14-.57.14-.52 0-.93-.41-.93-.93 0-.52.33-.83.7-.94 3.67-1.08 8.86-.82 12.29 1.41.34.2.55.5.55.92 0 .53-.42.65-.58.65z" fill="white" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@DataTimesVideo",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81z" fill="#FF0000" />
        <path d="M9.75 15.5l6.25-3.5-6.25-3.5v7z" fill="white" />
      </svg>
    ),
  },
];

export function FollowBar() {
  const theme = useMantineTheme();

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        padding: "14px 20px",
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: 10,
        background: theme.colors.background?.[2] || '#f8f6f0',
      }}
    >
      <span style={{ fontSize: 13, color: theme.colors.gray[6], marginRight: 2, whiteSpace: "nowrap" }}>
        Sledujte DataTimes:
      </span>
      {CHANNELS.map(({ label, url, icon }) => (
        <Anchor key={label} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <Button
            variant="default"
            size="compact-sm"
            radius="md"
            leftSection={icon}
            styles={{
              root: {
                fontSize: 13,
                fontWeight: 400,
                height: 'auto',
                padding: '6px 13px',
              },
              section: {
                marginRight: 7,
              },
            }}
          >
            {label}
          </Button>
        </Anchor>
      ))}
    </Box>
  );
}
