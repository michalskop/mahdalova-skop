---
title: "Filmový kalendář 2026"
date: "2026-01-26"
author: "Kateřina Mahdalová & Michal Škop"
excerpt: "Přehled nejdůležitějších filmových cen a festivalů roku 2026 – od Zlatých glóbů po Ji.hlavu"
coverImage: "images/filmovy-kalendar-2026.webp"
filter: ["kontext"]
tags: ["filmový kalendář", "film", "kultura", "kalendář", "festivaly", "ceny"]
promoted: 50
---
Filmový kalendář 2026

Rok 2026 přináší bohatý program filmových událostí – od lednových Zlatých glóbů přes jarní oscarovou sezónu až po podzimní dokumentární festivaly. V interaktivním kalendáři najdete všechny důležité termíny i základní informace o každé akci.


<div id="film-calendar-app"></div>
<style>
#film-calendar-app {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f8f6f0;
    color: #101432;
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;
}

#film-calendar-app * {
    box-sizing: border-box;
}

.cal-header {
    text-align: center;
    margin-bottom: 2rem;
}

.cal-header h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #101432;
    margin: 0 0 0.5rem 0;
}

.cal-header p {
    color: #812840;
    font-size: 0.95rem;
    margin: 0;
}

.cal-legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.cal-legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #101432;
}

.cal-legend-icon {
    font-size: 1.2rem;
}

/* Filters */
.cal-filters {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.cal-filter-btn {
    background: white;
    border: 2px solid #efb704;
    color: #101432;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    font-weight: 500;
}

.cal-filter-btn:hover {
    background: #ffcf02;
    border-color: #ffcf02;
}

.cal-filter-btn.active {
    background: #efb704;
    border-color: #efb704;
    color: #101432;
}

/* Timeline */
.cal-timeline-container {
    margin-bottom: 3rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

.cal-months-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    min-width: 700px;
    padding: 0 0.5rem;
}

.cal-month-label {
    font-size: 0.75rem;
    color: #812840;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: calc(100% / 12);
    text-align: center;
    font-weight: 600;
}

.cal-timeline-track {
    position: relative;
    height: 100px;
    background: white;
    border-radius: 8px;
    min-width: 700px;
    border: 1px solid rgba(16, 20, 50, 0.1);
}

.cal-timeline-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
}

.cal-grid-month {
    flex: 1;
    border-right: 1px solid rgba(16, 20, 50, 0.08);
}

.cal-grid-month:last-child {
    border-right: none;
}

.cal-timeline-event {
    position: absolute;
    height: 28px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
    z-index: 1;
}

.cal-timeline-event:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 20, 50, 0.2);
    z-index: 10;
}

.cal-timeline-event.award {
    background: #efb704;
    color: #101432;
}

.cal-timeline-event.festival {
    background: #de1743;
    color: white;
}

.cal-timeline-event .event-icon {
    font-size: 0.9rem;
    flex-shrink: 0;
}

/* Section headers */
.cal-section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2.5rem 0 1.5rem;
}

.cal-section-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.cal-section-header.awards h3 {
    color: #812840;
}

.cal-section-header.festivals h3 {
    color: #de1743;
}

.cal-section-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, rgba(16, 20, 50, 0.15), transparent);
}

/* Event cards */
.cal-events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.cal-event-card {
    background: white;
    border-radius: 10px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(16, 20, 50, 0.08);
    position: relative;
    overflow: hidden;
}

.cal-event-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
}

.cal-event-card.award::before {
    background: #efb704;
}

.cal-event-card.festival::before {
    background: #de1743;
}

.cal-event-card:hover {
    box-shadow: 0 4px 16px rgba(16, 20, 50, 0.12);
    transform: translateY(-2px);
}

.cal-event-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.cal-event-icon {
    font-size: 1.5rem;
    line-height: 1;
}

.cal-event-content {
    flex: 1;
}

.cal-event-date {
    font-size: 0.8rem;
    color: #812840;
    margin-bottom: 0.25rem;
    font-weight: 500;
}

.cal-event-name {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    line-height: 1.3;
    color: #101432;
}

.cal-event-subtitle {
    font-size: 0.8rem;
    color: #697fe6;
    font-style: italic;
}

.cal-event-expand {
    font-size: 0.75rem;
    color: #bb3a5d;
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 500;
}

.cal-event-expand svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
}

.cal-event-card.expanded .cal-event-expand svg {
    transform: rotate(180deg);
}

/* Expanded details */
.cal-event-details {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.cal-event-card.expanded .cal-event-details {
    max-height: 500px;
    margin-top: 1rem;
}

.cal-event-details-inner {
    padding-top: 1rem;
    border-top: 1px solid rgba(16, 20, 50, 0.1);
}

.cal-detail-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
    font-size: 0.85rem;
}

.cal-detail-label {
    color: #812840;
    min-width: 70px;
    font-weight: 500;
}

.cal-detail-value {
    color: #101432;
    flex: 1;
}

.cal-detail-value a {
    color: #697fe6;
    text-decoration: none;
}

.cal-detail-value a:hover {
    text-decoration: underline;
}

.cal-winner-tag {
    display: inline-block;
    background: rgba(239, 183, 4, 0.2);
    color: #812840;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
}

.cal-mobile-hint {
    text-align: center;
    color: #812840;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    display: none;
}

@media (max-width: 768px) {
    #film-calendar-app {
        padding: 1rem;
    }

    .cal-header h2 {
        font-size: 1.4rem;
    }

    .cal-mobile-hint {
        display: block;
    }

    .cal-events-grid {
        grid-template-columns: 1fr;
    }
}
</style>
<script>
(function() {
    const events = [
        // Awards
        {
            id: 'golden-globes',
            type: 'award',
            name: 'Zlaté glóby',
            nameEn: 'Golden Globe Awards',
            date: 'noc na 12. ledna',
            startDay: 11,
            endDay: 12,
            startMonth: 1,
            czech: false,
            tradition: 'Od roku 1944',
            edition: '83. ročník',
            description: 'Ceny Hollywoodské asociace zahraničního tisku za nejlepší filmovou a televizní tvorbu. Považovány za předzvěst Oscarů.',
            website: 'https://goldenglobes.com',
            winner2026: null,
            note: 'Výsledky budou vyhlášeny 12. ledna 2026'
        },
        {
            id: 'czech-critics',
            type: 'award',
            name: 'Ceny české filmové kritiky',
            nameEn: 'Czech Film Critics\' Awards',
            date: '7. února',
            startDay: 7,
            endDay: 7,
            startMonth: 2,
            czech: true,
            tradition: 'Od roku 2008',
            edition: '19. ročník',
            description: 'Nezávislé ocenění udělované Asociací českých filmových kritiků. Alternativa k Českým lvům s důrazem na uměleckou hodnotu.',
            website: 'https://www.filmovakritika.cz',
            winner2026: null
        },
        {
            id: 'spirit-awards',
            type: 'award',
            name: 'Ceny nezávislého filmu',
            nameEn: 'Film Independent Spirit Awards',
            date: '15. února',
            startDay: 15,
            endDay: 15,
            startMonth: 2,
            czech: false,
            tradition: 'Od roku 1984',
            edition: '41. ročník',
            description: 'Prestižní ocenění pro nezávislé filmy s rozpočtem do 30 milionů dolarů. Konají se den před Oscary.',
            website: 'https://filmindependent.org/spirit-awards',
            winner2026: null
        },
        {
            id: 'bafta',
            type: 'award',
            name: 'Britské filmové ceny BAFTA',
            nameEn: 'BAFTA Film Awards',
            date: '22. února',
            startDay: 22,
            endDay: 22,
            startMonth: 2,
            czech: false,
            tradition: 'Od roku 1949',
            edition: '79. ročník',
            description: 'Ceny Britské akademie filmového a televizního umění. Jedna z nejprestižnějších evropských filmových cen.',
            website: 'https://www.bafta.org',
            winner2026: null
        },
        {
            id: 'cesar',
            type: 'award',
            name: 'Francouzské filmové ceny César',
            nameEn: 'César Awards',
            date: '27. února',
            startDay: 27,
            endDay: 27,
            startMonth: 2,
            czech: false,
            tradition: 'Od roku 1976',
            edition: '51. ročník',
            description: 'Nejvýznamnější francouzské filmové ocenění, pojmenované po sochaři Césaru Baldaccini. Francouzský ekvivalent Oscarů.',
            website: 'https://www.academie-cinema.org',
            winner2026: null
        },
        {
            id: 'goya',
            type: 'award',
            name: 'Španělské filmové ceny Goya',
            nameEn: 'Goya Awards',
            date: '28. února',
            startDay: 28,
            endDay: 28,
            startMonth: 2,
            czech: false,
            tradition: 'Od roku 1987',
            edition: '40. ročník',
            description: 'Nejvýznamnější španělské filmové ocenění udělované Španělskou akademií filmových umění a věd.',
            website: 'https://www.premiosgoya.com',
            winner2026: null
        },
        {
            id: 'czech-lion',
            type: 'award',
            name: 'Český lev',
            nameEn: 'Czech Lion Awards',
            date: '14. března',
            startDay: 14,
            endDay: 14,
            startMonth: 3,
            czech: true,
            tradition: 'Od roku 1993',
            edition: '33. ročník',
            description: 'Nejvýznamnější české filmové ocenění udělované Českou filmovou a televizní akademií (ČFTA).',
            website: 'https://www.ceskylev.cz',
            winner2026: null
        },
        {
            id: 'oscars',
            type: 'award',
            name: 'Ceny Akademie (Oscary)',
            nameEn: 'Academy Awards (Oscars)',
            date: 'noc na 16. března',
            startDay: 15,
            endDay: 16,
            startMonth: 3,
            czech: false,
            tradition: 'Od roku 1929',
            edition: '98. ročník',
            description: 'Nejprestižnější filmové ocenění na světě udělované Akademií filmových umění a věd (AMPAS).',
            website: 'https://www.oscars.org',
            winner2026: null,
            note: 'Výsledky budou vyhlášeny 16. března 2026'
        },
        // Festivals
        {
            id: 'sundance',
            type: 'festival',
            name: 'Festival nezávislého filmu v Sundance',
            nameEn: 'Sundance Film Festival',
            date: '22. ledna – 1. února',
            startDay: 22,
            endDay: 32,
            startMonth: 1,
            czech: false,
            tradition: 'Od roku 1978',
            edition: '42. ročník',
            description: 'Největší festival nezávislého filmu v USA. Odrazový můstek pro nezávislé filmaře, založený Robertem Redfordem.',
            website: 'https://www.sundance.org',
            location: 'Park City, Utah, USA'
        },
        {
            id: 'berlinale',
            type: 'festival',
            name: 'Mezinárodní filmový festival v Berlíně',
            nameEn: 'Berlinale',
            date: '12. – 22. února',
            startDay: 12,
            endDay: 22,
            startMonth: 2,
            czech: false,
            tradition: 'Od roku 1951',
            edition: '76. ročník',
            description: 'Jeden z nejprestižnějších filmových festivalů světa. Hlavní cena: Zlatý medvěd. Součást "velké trojky" s Cannes a Benátkami.',
            website: 'https://www.berlinale.de',
            location: 'Berlín, Německo',
            mainPrize: 'Zlatý medvěd'
        },
        {
            id: 'jeden-svet',
            type: 'festival',
            name: 'Jeden svět',
            nameEn: 'One World',
            date: '11. – 24. března',
            startDay: 11,
            endDay: 24,
            startMonth: 3,
            czech: true,
            tradition: 'Od roku 1999',
            edition: '28. ročník',
            description: 'Největší festival dokumentárních filmů o lidských právech v Evropě. Pořádá organizace Člověk v tísni.',
            website: 'https://www.jedensvet.cz',
            location: 'Praha a další česká města'
        },
        {
            id: 'anifilm',
            type: 'festival',
            name: 'Mezinárodní festival animovaného filmu Anifilm',
            nameEn: 'Anifilm',
            date: '5. – 10. května',
            startDay: 5,
            endDay: 10,
            startMonth: 5,
            czech: true,
            tradition: 'Od roku 2010',
            edition: '17. ročník',
            description: 'Přehlídka nejlepší světové animované tvorby. Zaměřuje se na celovečerní i krátkometrážní animované filmy.',
            website: 'https://www.anifilm.cz',
            location: 'Liberec'
        },
        {
            id: 'cannes',
            type: 'festival',
            name: 'Mezinárodní filmový festival v Cannes',
            nameEn: 'Festival de Cannes',
            date: '12. – 22. května',
            startDay: 12,
            endDay: 22,
            startMonth: 5,
            czech: false,
            tradition: 'Od roku 1946',
            edition: '79. ročník',
            description: 'Nejprestižnější filmový festival světa. Hlavní cena: Zlatá palma. Setkání světové filmové elity.',
            website: 'https://www.festival-cannes.com',
            location: 'Cannes, Francie',
            mainPrize: 'Zlatá palma'
        },
        {
            id: 'kviff',
            type: 'festival',
            name: 'Mezinárodní filmový festival v Karlových Varech',
            nameEn: 'Karlovy Vary International Film Festival',
            date: '3. – 11. července',
            startDay: 3,
            endDay: 11,
            startMonth: 7,
            czech: true,
            tradition: 'Od roku 1946',
            edition: '60. ročník',
            description: 'Nejvýznamnější filmový festival ve střední a východní Evropě. Hlavní cena: Křišťálový globus. Kategorie A FIAPF.',
            website: 'https://www.kviff.com',
            location: 'Karlovy Vary',
            mainPrize: 'Křišťálový globus'
        },
        {
            id: 'lfs',
            type: 'festival',
            name: 'Letní filmová škola Uherské Hradiště',
            nameEn: 'Summer Film School',
            date: '24. – 30. července',
            startDay: 24,
            endDay: 30,
            startMonth: 7,
            czech: true,
            tradition: 'Od roku 1964',
            edition: '52. ročník',
            description: 'Nejstarší filmová přehlídka v ČR. Kombinace projekcí, seminářů a diskusí. Důraz na filmovou vzdělanost.',
            website: 'https://www.lfs.cz',
            location: 'Uherské Hradiště'
        },
        {
            id: 'venice',
            type: 'festival',
            name: 'Mezinárodní filmový festival v Benátkách',
            nameEn: 'Venice Film Festival',
            date: '2. – 12. září',
            startDay: 2,
            endDay: 12,
            startMonth: 9,
            czech: false,
            tradition: 'Od roku 1932',
            edition: '83. ročník',
            description: 'Nejstarší filmový festival světa. Hlavní cena: Zlatý lev. Součást Benátského bienále.',
            website: 'https://www.labiennale.org/en/cinema',
            location: 'Benátky, Itálie',
            mainPrize: 'Zlatý lev'
        },
        {
            id: 'tiff',
            type: 'festival',
            name: 'Mezinárodní filmový festival v Torontu',
            nameEn: 'Toronto International Film Festival',
            date: '10. – 20. září',
            startDay: 10,
            endDay: 20,
            startMonth: 9,
            czech: false,
            tradition: 'Od roku 1976',
            edition: '51. ročník',
            description: 'Největší veřejně přístupný filmový festival na světě. Klíčový pro oscarovou sezónu. Cena publika často předznamenává Oscary.',
            website: 'https://www.tiff.net',
            location: 'Toronto, Kanada',
            mainPrize: 'People\'s Choice Award'
        },
        {
            id: 'jihlava',
            type: 'festival',
            name: 'Mezinárodní festival dokumentárních filmů Ji.hlava',
            nameEn: 'Ji.hlava IDFF',
            date: '23. října – 1. listopadu',
            startDay: 23,
            endDay: 32,
            startMonth: 10,
            czech: true,
            tradition: 'Od roku 1997',
            edition: '30. ročník',
            description: 'Největší festival dokumentárních filmů ve střední a východní Evropě. Zaměření na autorský dokument.',
            website: 'https://www.ji-hlava.cz',
            location: 'Jihlava'
        }
    ];

    function getTimelinePosition(startMonth, startDay, endMonth, endDay) {
        const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const totalDays = 365;
        
        let startDayOfYear = 0;
        for (let i = 1; i < startMonth; i++) {
            startDayOfYear += daysInMonth[i];
        }
        startDayOfYear += startDay;

        let endDayOfYear = 0;
        let actualEndMonth = endMonth || startMonth;
        let actualEndDay = endDay || startDay;
        
        if (actualEndDay > daysInMonth[actualEndMonth]) {
            actualEndDay = actualEndDay - daysInMonth[actualEndMonth];
            actualEndMonth++;
        }
        
        for (let i = 1; i < actualEndMonth; i++) {
            endDayOfYear += daysInMonth[i];
        }
        endDayOfYear += actualEndDay;

        const left = ((startDayOfYear - 1) / totalDays) * 100;
        const width = Math.max(((endDayOfYear - startDayOfYear + 1) / totalDays) * 100, 2);

        return { left, width };
    }

    function renderCalendar() {
        const container = document.getElementById('film-calendar-app');
        if (!container) return;

        container.innerHTML = `
            <div class="cal-header">
                <h2>Filmový kalendář 2026</h2>
                <p>Přehled filmových cen a festivalů</p>
            </div>

            <div class="cal-legend">
                <div class="cal-legend-item">
                    <span class="cal-legend-icon">🏆</span>
                    <span>Filmové ceny</span>
                </div>
                <div class="cal-legend-item">
                    <span class="cal-legend-icon">🎬</span>
                    <span>Filmové festivaly</span>
                </div>
            </div>

            <div class="cal-filters">
                <button class="cal-filter-btn active" data-filter="all">Vše</button>
                <button class="cal-filter-btn" data-filter="award">Pouze ceny</button>
                <button class="cal-filter-btn" data-filter="festival">Pouze festivaly</button>
                <button class="cal-filter-btn" data-filter="czech">České události</button>
            </div>

            <div class="cal-timeline-container">
                <div class="cal-months-bar">
                    <span class="cal-month-label">Led</span>
                    <span class="cal-month-label">Úno</span>
                    <span class="cal-month-label">Bře</span>
                    <span class="cal-month-label">Dub</span>
                    <span class="cal-month-label">Kvě</span>
                    <span class="cal-month-label">Čvn</span>
                    <span class="cal-month-label">Čvc</span>
                    <span class="cal-month-label">Srp</span>
                    <span class="cal-month-label">Zář</span>
                    <span class="cal-month-label">Říj</span>
                    <span class="cal-month-label">Lis</span>
                    <span class="cal-month-label">Pro</span>
                </div>
                <div class="cal-timeline-track">
                    <div class="cal-timeline-grid">
                        ${Array(12).fill('<div class="cal-grid-month"></div>').join('')}
                    </div>
                    <div id="cal-timeline-events"></div>
                </div>
                <p class="cal-mobile-hint">← Posuňte pro zobrazení celého roku →</p>
            </div>

            <div class="cal-section-header awards">
                <h3>🏆 Filmové ceny</h3>
                <div class="cal-section-line"></div>
            </div>
            <div class="cal-events-grid" id="cal-awards-grid"></div>

            <div class="cal-section-header festivals">
                <h3>🎬 Filmové festivaly</h3>
                <div class="cal-section-line"></div>
            </div>
            <div class="cal-events-grid" id="cal-festivals-grid"></div>
        `;

        // Render timeline
        const timelineContainer = document.getElementById('cal-timeline-events');
        const rows = [[], [], [], []];
        
        events.forEach(event => {
            const pos = getTimelinePosition(event.startMonth, event.startDay, event.startMonth, event.endDay);
            
            let rowIndex = 0;
            for (let i = 0; i < rows.length; i++) {
                const canFit = rows[i].every(existing => {
                    return pos.left >= existing.right || (pos.left + pos.width) <= existing.left;
                });
                if (canFit) {
                    rowIndex = i;
                    break;
                }
            }
            
            rows[rowIndex].push({ left: pos.left, right: pos.left + pos.width });

            const el = document.createElement('div');
            el.className = `cal-timeline-event ${event.type}`;
            el.style.left = `${pos.left}%`;
            el.style.width = `${Math.max(pos.width, 3)}%`;
            el.style.top = `${8 + rowIndex * 24}px`;
            
            const icon = event.type === 'award' ? '🏆' : '🎬';
            const shortName = event.name.length > 15 ? event.name.substring(0, 13) + '…' : event.name;
            el.innerHTML = `<span class="event-icon">${icon}</span><span>${shortName}</span>`;
            el.title = event.name;
            el.dataset.id = event.id;
            el.dataset.type = event.type;
            el.dataset.czech = event.czech;
            
            el.addEventListener('click', () => {
                const card = document.querySelector(`.cal-event-card[data-id="${event.id}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.add('expanded');
                }
            });
            
            timelineContainer.appendChild(el);
        });

        // Render cards
        const awardsGrid = document.getElementById('cal-awards-grid');
        const festivalsGrid = document.getElementById('cal-festivals-grid');

        events.forEach(event => {
            const icon = event.type === 'award' ? '🏆' : '🎬';
            
            let detailsHTML = `
                <div class="cal-detail-row">
                    <span class="cal-detail-label">Tradice:</span>
                    <span class="cal-detail-value">${event.tradition}</span>
                </div>
                <div class="cal-detail-row">
                    <span class="cal-detail-label">Ročník:</span>
                    <span class="cal-detail-value">${event.edition}</span>
                </div>
            `;

            if (event.location) {
                detailsHTML += `
                    <div class="cal-detail-row">
                        <span class="cal-detail-label">Místo:</span>
                        <span class="cal-detail-value">${event.location}</span>
                    </div>
                `;
            }

            if (event.mainPrize) {
                detailsHTML += `
                    <div class="cal-detail-row">
                        <span class="cal-detail-label">Hlavní cena:</span>
                        <span class="cal-detail-value">${event.mainPrize}</span>
                    </div>
                `;
            }

            detailsHTML += `
                <div class="cal-detail-row">
                    <span class="cal-detail-label">Popis:</span>
                    <span class="cal-detail-value">${event.description}</span>
                </div>
                <div class="cal-detail-row">
                    <span class="cal-detail-label">Web:</span>
                    <span class="cal-detail-value"><a href="${event.website}" target="_blank" rel="noopener">${event.website.replace('https://', '').replace('www.', '')}</a></span>
                </div>
            `;

            if (event.winner2026) {
                detailsHTML += `
                    <div class="cal-detail-row">
                        <span class="cal-detail-label">Vítěz 2026:</span>
                        <span class="cal-detail-value"><span class="cal-winner-tag">🏆 ${event.winner2026}</span></span>
                    </div>
                `;
            } else if (event.note) {
                detailsHTML += `
                    <div class="cal-detail-row">
                        <span class="cal-detail-label">Poznámka:</span>
                        <span class="cal-detail-value" style="font-style: italic; color: #812840;">${event.note}</span>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = `cal-event-card ${event.type}`;
            card.dataset.id = event.id;
            card.dataset.type = event.type;
            card.dataset.czech = event.czech;

            card.innerHTML = `
                <div class="cal-event-header">
                    <span class="cal-event-icon">${icon}</span>
                    <div class="cal-event-content">
                        <div class="cal-event-date">${event.date}</div>
                        <div class="cal-event-name">${event.name}</div>
                        <div class="cal-event-subtitle">${event.nameEn}</div>
                    </div>
                </div>
                <div class="cal-event-expand">
                    Více informací
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="cal-event-details">
                    <div class="cal-event-details-inner">
                        ${detailsHTML}
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                card.classList.toggle('expanded');
            });

            if (event.type === 'award') {
                awardsGrid.appendChild(card);
            } else {
                festivalsGrid.appendChild(card);
            }
        });

        // Setup filters
        document.querySelectorAll('.cal-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cal-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                document.querySelectorAll('.cal-event-card, .cal-timeline-event').forEach(el => {
                    if (filter === 'all') {
                        el.style.display = '';
                    } else if (filter === 'czech') {
                        el.style.display = el.dataset.czech === 'true' ? '' : 'none';
                    } else {
                        el.style.display = el.dataset.type === filter ? '' : 'none';
                    }
                });

                const awardsSection = document.querySelector('.cal-section-header.awards');
                const festivalsSection = document.querySelector('.cal-section-header.festivals');
                
                if (filter === 'festival') {
                    awardsSection.style.display = 'none';
                    festivalsSection.style.display = '';
                } else if (filter === 'award') {
                    awardsSection.style.display = '';
                    festivalsSection.style.display = 'none';
                } else {
                    awardsSection.style.display = '';
                    festivalsSection.style.display = '';
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCalendar);
    } else {
        renderCalendar();
    }
})();
</script>

Kalendář budeme průběžně aktualizovat o výsledky jednotlivých cen.
