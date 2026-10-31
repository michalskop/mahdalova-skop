---
title: "Brazil's presidential election: Lula wins the runoff, prediction shows"
date: "2026-10-25"
time: "23:45"
author: "Kateřina Mahdalová & Michal Škop"
translator: "Translated from Czech with AI assistance"
original: "https://www.datatimes.cz/clanek/volby-brazilie-2026-10-25-druhe-kolo-vyhrava-lula"
excerpt: "Polls before the runoff had Flávio Bolsonaro slightly ahead, and during the night the running count briefly put him in front of Lula. From the first minutes of the count, however, the DataTimes.cz prediction pointed to a win for the incumbent president: Lula will finish on 51.8 per cent and beat the son of his predecessor by more than four million votes."
coverTitulek: "Lula wins<br>the runoff"
coverPodtitulek: "Lula 51.8%, Flávio Bolsonaro 48.2%<br>First-round winner loses by 4.4&nbsp;million votes"
coverImage: "images/cover-homepage.png"
homepageImage: "images/cover-homepage.png"
ogImage: "images/cover-og.jpg"
squareImage: "images/cover-square.png"
filter: ["work"]
tags: ["elections", "brazil", "lula", "flávio bolsonaro", "jair bolsonaro", "latin america", "election prediction"]
promoted: 1
---
Brazil voted for its president in a runoff on Sunday 25 October and, according to the prediction, the incumbent, Luiz Inácio Lula da Silva, is winning. After the count of polling stations covering two thirds of registered voters, the data model built by the journalist duo Mahdalová & Škop gives him 51.8 per cent of valid votes. Senator Flávio Bolsonaro, son of the jailed former president Jair Bolsonaro, will get 48.2 per cent. Lula will thus beat the first-round winner by 4.4 million votes, twice the margin by which he defeated his father four years ago. He will become the first candidate since direct presidential elections were restored in 1989 to win the presidency after finishing second in the first round.

```infobox info
We recalculated the prediction every minute from 21:12 CET (17:12 Brazilian time) using live data from Brazil's Superior Electoral Court (TSE). The figures in the text reflect the state of the count at 00:58 CET, when polling stations covering 68.2 per cent of registered voters had been counted. Like the TSE, we calculate shares from valid votes, that is, votes cast for one of the two candidates. The official final result was not yet available when this article was published.
```

## Polls had Flávio Bolsonaro in the lead

Flávio Bolsonaro went into the runoff with a slight edge. The final Datafolha poll, conducted on 23 and 24 October, gave him 51 per cent of valid votes against 49 per cent for Lula, with a margin of error of two percentage points ([The Rio Times](https://www.riotimesonline.com/datafolha-poll-flavio-51-lula-49-final-runoff-2026/)). Quaest, in a survey conducted from 17 to 20 October, measured 50.6 to 49.4 per cent in Flávio Bolsonaro's favour ([The Rio Times](https://www.riotimesonline.com/quaest-poll-flavio-45-lula-44-runoff-2026/)).

The polls built on the first round, which Flávio Bolsonaro won on 4 October. According to the official TSE result, he took 47.03 per cent of valid votes and Lula 45.16 per cent, a gap of roughly 2.2 million votes ([The Rio Times](https://www.riotimesonline.com/brazil-election-first-round-state-results-2026)). Our election-night prediction differed from that result by less than a tenth of a percentage point: it gave Flávio Bolsonaro 47.01 per cent and Lula 45.22 per cent.

History was on the side of the first-round winner. Since 1989, when Brazilians once again began electing their president directly after the military dictatorship, the election has gone to a runoff seven times, and each time it was won by the candidate who had led after the first round. Lula himself won the first round in 2002, 2006 and 2022.

Anyone estimating the runoff result from these figures had good reason to bet on Flávio Bolsonaro. Between the two rounds, however, two things changed that the polls did not capture: which way the voters of the ten eliminated candidates, who together received 7.8 per cent in the first round, would lean, and how many people would turn out to vote.

## The running count briefly showed Flávio ahead, the prediction never did

Election night once again had two faces. The TSE's running total flipped several times during the evening: in the first minutes after polling stations closed it showed Lula at almost sixty per cent, then his share fell, and from 23:55 CET, when just under a sixth of voters had been counted, Flávio Bolsonaro led in the counted votes. He peaked at 50.44 per cent. Lula did not return to the lead in the running count until 00:32, with 44 per cent of voters counted.

<SupportBanner float="left" />

The DataTimes.cz prediction, meanwhile, showed the same thing all night. It had Lula in the lead from the first update at 21:12 CET and, from the moment one per cent of voters had been counted, gave him between 51.55 and 51.77 per cent. Over the night the estimate moved by only about two tenths of a percentage point, while the running total over the same period ranged between 49.56 and 52.60 per cent for Lula.

From 23:45, with ten per cent of voters counted, the prediction's entire 90 per cent uncertainty interval lay above the 50 per cent threshold. At 00:58 it ranges from 51.65 to 51.89 per cent. A control model, which works with larger electoral zones instead of individual polling stations, arrived at almost the same figure: 51.8 per cent for Lula.

<BrazilRunoffTimelineEn />

## Why the running total misleads

```infobox right
Polling stations report their results gradually and not at random. When places where one candidate has stronger support are among the first to report, that candidate looks more successful in the running total than they will eventually be nationwide. The model looks for similar polling stations based on previous elections, continuously adjusts its estimate of the swing according to the results just counted, and in this way extrapolates from the reported part to the part not yet counted.
```

Who leads in the running count depends mainly on the order in which states deliver their results. By 00:58 CET, more than 96 per cent of voters had been counted in the Federal District, Paraná, Mato Grosso do Sul and Espírito Santo, where Flávio Bolsonaro leads. In Bahia, the most populous state of Lula's north-east, 56 per cent of voters had been counted, in Piauí 68 per cent and in Sergipe 23 per cent.

The two largest states pull in the opposite direction. In São Paulo, where Flávio Bolsonaro leads, roughly half of voters had been counted, and in the state of Rio de Janeiro 18 per cent. At that moment, therefore, the running total overstated Flávio Bolsonaro because of the south and centre-west, and at the same time understated him because of São Paulo and Rio.

The model does not follow the running total. For each state separately it estimates how the polling stations not yet counted will vote, and only then assembles the national result from these estimates. That is why a small but geographically dispersed share of counted polling stations is enough for it.

## Minas Gerais has swung to Lula

According to the prediction, Lula will win in 13 of the 27 federative units and Flávio Bolsonaro in 14. Compared with the first round, only one state changes hands: Minas Gerais, Brazil's second most populous state with more than 16 million voters. Three weeks ago Flávio Bolsonaro led there; in the runoff the prediction gives him 49.5 per cent and Lula 50.5 per cent (interval 50.3–50.6).

Brazilians regard Minas Gerais as a miniature of the whole country. Since 1989, no one has become president without winning this state ([Metrópoles](https://metropoles.com/sao-paulo/por-que-mg-define-corrida-presidencial)). This year, however, it is hard to read the winner from it: Lula's estimated lead there amounts to roughly 120,000 votes out of 4.4 million nationwide.

<BrazilRunoffStatesEn />

The decisive votes for Lula come from the north-east. According to the prediction, Bahia alone will give him 3.9 million more votes than Flávio Bolsonaro, Pernambuco 2.3 million more and Ceará 2.2 million more. Flávio Bolsonaro gains most in São Paulo (a lead of two million votes), Santa Catarina and Paraná (1.8 and 1.7 million). Brazilians abroad, according to the prediction, vote for Lula by 54 to 46 per cent.

## Lula gained almost three points, and three million more people turned out

In the first round, Lula had 49.0 per cent of the votes cast for the two strongest candidates. In the runoff, the prediction gives him 51.8 per cent, that is, 2.78 percentage points more. Turnout also rose: the model estimates it at 80.9 per cent (interval 80.7–81.0), compared with 78.92 per cent of voters in the first round. The difference of two percentage points corresponds to roughly 3.2 million people who voted in the runoff but not in the first round.

The data cannot yet tell what role each of these played. Lula may have won over more voters of the eliminated candidates than expected, people who had not previously voted for him may have come to the polls, or some of Flávio Bolsonaro's voters may have stayed at home. The answer will only come from an analysis of individual polling stations after the official result.

## A fourth term at eighty-one

Lula, who led Brazil from 2003 to 2010 and again since 2023, will celebrate his 81st birthday on 27 October. His new term will not begin on 1 January as it did for his predecessors since 1995: under a 2021 constitutional amendment, the president will be sworn in on 5 January 2027 ([Rádio Senado](https://www12.senado.leg.br/radio/1/noticia/2026/01/05/posse-presidencial-em-2027-sera-em-5-de-janeiro-e-governadores-tomam-posse-no-dia-6)). It will be his fourth term in office.

For Flávio Bolsonaro, a senator for the Liberal Party (PL), defeat marks the end of an attempt to return the family to the presidential palace. He was handed the candidacy in December 2025 by his father, who is serving a sentence of 27 years and three months for attempting a coup. The Bolsonarist camp nevertheless remains strong: according to the prediction, Flávio Bolsonaro will receive almost 60 million votes and more than 65 per cent in five states (Roraima, Rondônia, Santa Catarina, Acre and Mato Grosso).

We will update this article once the TSE publishes the final official result.

Read our follow-up analysis: [Why Lula won](/a/elections-brazil-2026-10-26-why-lula-won/).

<RelatedArticles heading="🔻🔻🔻" />
