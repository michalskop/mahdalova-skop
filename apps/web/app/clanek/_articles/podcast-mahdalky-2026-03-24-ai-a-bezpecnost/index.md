---
title: "Vibe coding: když aplikaci postaví AI a nikdo neví, co je uvnitř"
date: "2027-03-26"
author: "Kateřina Mahdalová & Michal Škop"
excerpt: "Člověk si sedne k počítači, řekne mu co chce, a za odpoledne má hotovou aplikaci. Nenapsal ani řádek kódu. A často neví, jestli je ta aplikace bezpečná, nebo jen vypadá bezpečně."
coverImage: "images/vibe-coding-mahdalky-datatimes-2026.webp"
filter: "Podcast"
tags: 
  - vibe coding
  - umělá inteligence
  - bezpečnost
  - software
  - jazykové modely
promoted: 48
---
## Vibe coding: když aplikaci postaví AI a nikdo neví, co je uvnitř

To si člověk sedne k počítači, řekne mu — jazykovému modelu — co chce, a za odpoledne má hotovou aplikaci. Neprogramoval, nenapsal ani řádek kódu, zadal prompt ve svém přirozeném jazyce, jak mu zobák narost. A často úplně dobře neví, co v té aplikaci vlastně je, co běží na pozadí. Neví, jestli ten systém je bezpečný, nebo jen vypadá bezpečně.

Říká se tomu **vibe coding** — něco jako živelné kódování, programování bez znalosti toho, co se děje uvnitř samotné aplikace či webu, který takto vznikne. Na první pohled to vypadá spíš jako okrajová věc pro pár nadšenců. Jenže takto vzniklé aplikace dnes používají miliony lidí, kteří o jejich původu nic nevědí.

### Databáze otevřená dokořán

V červenci 2025 se ukázalo, co to v praxi znamená. [Seznamovací aplikace pro ženy Tea](https://www.keypasco.com/en/spill-the-tea-tea-the-1-womens-dating-app-faces-major-data-breach-private-data-publicly-exposed/) zveřejnila — nechtěně — 72 tisíc fotek včetně 13 tisíc fotografií dokladů totožnosti. Bezpečnostní experti zjistili, že databáze byla zcela otevřená, ponechaná ve výchozím nastavení. Nikdo nezlomil žádný zámek, nešlo o útok hackerů. Autoři aplikace prostě nenakonfigurovali zabezpečení. Databáze tam stála otevřená jako dveře, ke kterým nikdo nepřipevnil zámek.

### Agent, který lhal

Jiný příběh přišel ze stejného měsíce. Americký investor [Jason Lemkin](https://www.businessinsider.com/replit-ceo-apologizes-ai-coding-tool-delete-company-database-2025-7) svěřil svou práci autonomnímu AI agentovi v prostředí [Replit](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) — cloudovém nástroji pro vibe coding. Devět dní budoval databázi kontaktů s více než 1 200 manažery a tisícovkou firem. Pak agentovi nařídil, ať nic nemění — jde o takzvaný code freeze, příkaz k zastavení veškerých změn.

Agent příkaz ignoroval. Sám se rozhodl, že databáze potřebuje vyčistit, a smazal ji. Když se Lemkin zeptal, jestli lze data obnovit, agent odpověděl, že ne — že „zničil všechny verze databáze." Nakonec se ukázalo, že lhal. Data obnovit šla.

„Jak může kdokoli na světě používat tento nástroj v produkci, když ignoruje všechny příkazy a smaže vám databázi?" napsal Lemkin. Šéf Replitu Amjad Masad se za incident veřejně omluvil a označil ho za „nepřijatelný."

### Co riskujeme

V novém díle Mahdalek se bavíme o tom, jak moc lze věřit softwaru, který nikdo pořádně nezkontroloval. A co riskujeme, když nástroje, jimž nerozumíme, pustíme ke svým datům, svým penězům a svému životu.

---

*Fakta místo dojmů, dvě generace, dva pohledy. Jedna máma, jedna dcera a jeden podcast.*
