// app/about/page.tsx
import { Box, Group, Title, Stack, Paper, Container, Text, useMantineTheme } from '@mantine/core';
import { ContentSection } from '@/components/about/ContentSection';
import Testimonials from '@/components/common/Testimonials';
import { ContactsBlock } from '@/components/common/ContactsBlock';
import fs from 'fs/promises';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';


async function getMarkdownContent(filename: string) {
  const filePath = path.join(process.cwd(), 'components', 'about', filename);
  const content = await fs.readFile(filePath, 'utf8');
  // Serialize the markdown content
  const mdxSource = await serialize(content);
  return mdxSource;
}


export default async function AboutPage() {
  const aboutContent = await getMarkdownContent('../../app/about/about-us.md');
  const katerinaContent = await getMarkdownContent('../../app/about/katerina.md');
  const michalContent = await getMarkdownContent('../../app/about/michal.md');
  const whatWeDoContent = await getMarkdownContent('../../app/about/co-delame.md');
  

  return (
    <Container 
      size="lg"
      bg="background.2"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <Paper py={50} bg="brandRoyalBlue.9" radius={0}>
        <Container>
          <Title 
            order={1}
            ta="right"
            size="calc(2rem + 1.5vw)"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
            c="brand"
            fw="bold"
          >
            Mahdalová & Škop
          </Title>
          <Title ta="right" size="h1" c="background.1">
              Necháváme&nbsp;
              <span style={{ color: 'var(--mantine-color-brandYellow-6)' }}>
                mluvit data
              </span>
              .
          </Title>
        </Container>
      </Paper>

      <ContentSection 
        sectionTitle="About us"
        content={aboutContent}
        themeColor="brandRoyalBlue.6"
        textColor="background.1"
      />

      <ContentSection 
        sectionTitle="Kateřina"
        content={katerinaContent}
        themeColor="brandDeepRed.6"
        textColor="background.1"
      />

      <ContentSection 
        sectionTitle="Michal"
        content={michalContent}
        themeColor="brandOrange.6"
        textColor="background.1"
      />

      <ContentSection 
        sectionTitle="Our work"
        content={whatWeDoContent}
        themeColor="brandDeepRed.6"
        textColor="background.1"
      />
      
      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>

      <Testimonials />
        
      <ContactsBlock />
    </Container>
  );
};