---
title: "Israel election: Netanyahu will not win a majority, prediction shows"
date: "2026-10-27"
time: "23:30"
author: "Kateřina Mahdalová & Michal Škop"
translator: "Translated from Czech with AI assistance"
original: "https://www.datatimes.cz/clanek/volby-izrael-2026-10-27-netanjahu-bez-vetsiny-ukazuje-predikce"
excerpt: "Pre-election polls put Eisenkot's Yashar in the lead, and the overnight running tally overstated Likud. From the first hour of the count, the DataTimes.cz prediction showed a stalemate: Netanyahu's bloc will end up with 53 seats, Gadi Eisenkot's opposition with 48, and the 19 members of the Arab parties will decide whether anyone has a majority."
coverImage: "images/cover-homepage.png"
homepageImage: "images/cover-homepage.png"
ogImage: "images/cover-og.jpg"
squareImage: "images/cover-square.png"
instagramImage: "images/cover-instagram.png"
coverTitulek: "Netanyahu<br>will not win<br>a majority"
coverPodtitulek: "The prediction puts his bloc<br>eight seats short of a majority"
filter: ["work"]
tags: ["elections", "israel", "israel election 2026", "knesset", "benjamin netanyahu", "gadi eisenkot", "arab voters", "election prediction", "middle east"]
promoted: 1
---

Israelis elected a new parliament on Tuesday 27 October. It is called the Knesset and has a single chamber of 120 members, so a government needs 61 votes there. According to the prediction, neither bloc will win such a majority. The data model built by data journalists Kateřina Mahdalová and Michal Škop gives the five parties of Benjamin Netanyahu's outgoing coalition 53 of the 120 seats, eight fewer than they need for a majority. The opposition led by Gadi Eisenkot, a former chief of the general staff, will end up with 48 seats. The remaining 19 seats will go to two Arab parties, more than ever before.

```infobox info
The model was recalculated from 23:24 CET, just under two and a half hours after polling stations closed at 21:00 CET (22:00 Israeli time), using interim results from the [Central Elections Committee](https://votes26.bechirot.gov.il/). The figures in the text come from the last recalculation on Thursday 29 October at 6:59 CET, when 98.7% of regular polling stations and roughly 6% of double-envelope ballots had been counted. The committee will announce the final results by 4 November.
```

## Polls expected Eisenkot in the lead, the prediction showed a stalemate from the start

The final polls by the three main television channels, published on Friday 23 October, saw Eisenkot's Yashar as the strongest party with 22 to 23 seats. Likud came second in them with 19 to 21. Eisenkot's bloc had 52 to 56 seats, Netanyahu's 50 and the Arab parties 14 to 16, [the daily Haaretz summed up](https://www.haaretz.com/israel-news/elections/2026-10-23/ty-article/last-polls-before-election-day-put-eisenkot-ahead-both-sides-short-of-majority/000001a1-69fe-d34e-a1b9-ffff12940000). None of the polls expected a majority.

The prediction was recalculated 128 times during the count, from Tuesday night, when 0.05% of the votes had been counted, to Thursday morning. The model compares each counted polling station with the same polling station in 2022. From the shift it sees in the counted stations, it estimates how neighbouring and similar stations that have not yet been counted will vote, and adds an estimate of the double-envelope ballots. These are cast by soldiers, diplomats and people in hospital.

The prediction never once gave either bloc a majority of 61 seats. At most it gave Netanyahu's bloc 58 seats, in the first hours, and Eisenkot's opposition 48 or 49. As more polling stations were counted, Netanyahu's bloc gradually lost ground and the Arab parties gained.

Since 8:17 CET on Wednesday, when 66% of the votes had been counted, the prediction has held at 53, 48 and 19 seats. The committee's count so far shows the same distribution between the blocs. Individual seats may still shift within the blocs, however.

<VegaChart dataFile="data/predikce-bloky.json" />

## The running tally overstated Likud, the Arab parties reported late

In the first hours, Likud had around 27% of the vote in the committee's running tally, at most 27.75%. The first polling stations to be counted favoured it more than the rest of the country. From the moment one per cent of the votes had been counted, the prediction gave it between 20.6% and 21.9%, and from the first recalculation it saw Likud ahead of Yashar with a probability above 95%. With 98.7% of polling stations counted, Likud has 20.7%.

<SupportBanner float="left" />The prediction was wrong for longest about the Arab parties. At first it gave them 13 seats and only worked its way up to 19 over the whole night. The model is based on how polling stations voted in 2022, when roughly half of voters in Arab localities turned out.

A jump in turnout as large as this year's could not be estimated from the first polling stations to be counted. Arab localities also reported their results later than Jewish ones. Even with half of the votes counted, the Arab parties had 12% of the vote in the running tally; with almost all polling stations counted, they have 15.3%.

Polling stations report their results gradually, and not at random. When places where a party has stronger support are among the first, that party looks more successful in the running tally than it will eventually be nationwide. The model therefore does not take over the running tally and fills in the polling stations not yet counted on the basis of those that resemble them.

<VegaChart dataFile="data/predikce-prubezny-soucet.json" />

## Likud will finish first, the Arab parties will lose share once the envelopes are counted

The last recalculation estimates the final result as follows: Likud 27 seats (90% interval 26–28), Yashar 21, the Joint List 12, Naftali Bennett and Yair Lapid's Beyachad 11, the Democrats and Yisrael Beytenu 8 each, Ra'am, United Torah Judaism and Otzma Yehudit 7 each, Shas and Religious Zionism 6 each. According to the prediction, the Reservists' party and Ofer Winter's party will stay below the 3.25% electoral threshold.

Compared with the count so far, a few seats will still move: Likud and Yisrael Beytenu would each gain one, Shas and Beyachad would each lose one, and between the Arab parties the ratio would return from 11 to 8 to 12 to 7. Double-envelope ballots are cast mainly by soldiers, so the model expects the Arab parties' share to fall from 15.3% to 14.7% once they are counted.

The model estimates overall turnout at 78.6% (90% interval 77.5–80.3%). In 2022, [70.6% of eligible voters](https://votes25.bechirot.gov.il/) turned out.

## Nobody can form a government without the Arab parties

Netanyahu is eight seats short of a majority, Eisenkot thirteen. Most Jewish parties, meanwhile, refuse to govern with the Arab parties. Once the final results are announced, President Isaac Herzog will task whoever has the best chance of securing 61 votes with forming a government. If no majority can be found, Israel will go to the polls again.

Why Arab voters turned out in record numbers this year, who voted how and which coalitions are possible, we analyse in a [separate article](/a/elections-israel-2026-10-28-arab-parties-hold-the-key/).

```infobox
**How we calculated it**

The prediction by data journalists Kateřina Mahdalová and Michal Škop is based on the interim results by polling station published by the [Central Elections Committee](https://votes26.bechirot.gov.il/). The model compares each counted polling station with the result of the same polling station in 2022. Polling stations that have changed over the four years are matched with neighbouring stations and, as a last resort, with the municipality. From the shift in the counted stations it estimates the result of those not yet counted and adds the expected double-envelope ballots, which the committee records separately. It allocates seats in the same way as the committee: a 3.25% electoral threshold, the D'Hondt method (known in Israel as the Bader-Ofer method) and surplus-vote agreements between parties. The intervals give the range within which, according to the model, the final result will fall with 90% probability. Netanyahu's bloc consists of Likud, Shas, United Torah Judaism, Otzma Yehudit and Religious Zionism; Eisenkot's bloc of Yashar, Beyachad, the Democrats and Yisrael Beytenu.
```

<RelatedArticles heading="🔻🔻🔻" />
