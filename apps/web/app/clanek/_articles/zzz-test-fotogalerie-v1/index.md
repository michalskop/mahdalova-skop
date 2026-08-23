---
title: "Test: Fotogalerie"
date: "9999-12-29"
author: "Dev Team"
excerpt: "Testovací článek pro komponentu Fotogalerie – náhledová mřížka, která se po kliknutí rozbalí do svislého sloupce velkých fotek."
tags: ["test", "components"]
promoted: 0
---

> Testovací článek pro komponentu **Fotogalerie**. Skrytý z výpisů (datum v budoucnu).

Komponenta funguje jako na super.cz: v místě, kam ji vložíš, se zobrazí **řádek stejně velkých náhledů**. Po kliknutí na kteroukoli fotku se galerie **rozbalí přímo na místě** do svislého sloupce velkých fotek – a text článku plyne dál pod ní.

Fotky níž mají schválně **různé poměry stran** (na výšku, na šířku, čtverec, panorama), aby bylo vidět, že náhledy drží vždy stejný rám, ale v rozbaleném stavu je vidět celá fotka.

```fotogalerie
- https://picsum.photos/id/1015/1200/1600 | Řeka mezi horami | Foto: Picsum
- https://picsum.photos/id/1043/1600/900 | Širokoúhlý záběr do krajiny
- https://picsum.photos/id/1025/1000/1000 | Čtvercový portrét
- https://picsum.photos/id/1039/1600/700 | Panorama pobřeží
- https://picsum.photos/id/1074/900/1600 | Fotka na výšku
- https://picsum.photos/id/1084/1400/1050 | Klasický poměr 4:3 | Ilustrační foto
```

Text pokračuje pod galerií, jako by tam žádná nebyla – přesně takhle to půjde vložit i doprostřed odstavců v běžném článku.

## Druhá galerie s "+N"

Když je fotek víc, než se má hned ukázat, zbylé se schovají pod dlaždici s „+N". Tady je jich šest, ale ukazují se jen čtyři – počet se zapíše za fence, tedy `fotogalerie 4`:

```fotogalerie 4
- https://picsum.photos/id/200/1200/800
- https://picsum.photos/id/201/800/1200
- https://picsum.photos/id/202/1000/1000
- https://picsum.photos/id/203/1600/900
- https://picsum.photos/id/204/900/1600
- https://picsum.photos/id/206/1400/1000
```

Konec testovacího článku.
