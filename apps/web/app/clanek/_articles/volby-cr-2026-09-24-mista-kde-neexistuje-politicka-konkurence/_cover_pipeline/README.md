# Covery: mapy obcí (tento článek + analyza-2026-10-02-kolik-ma-cesko-obci)

1. `node maps.cjs <repo> <out>` – z `obce-geo.json` / `obce-data.json` vykreslí dvě mapy 2400×1600
   (`map-kandidatky.png`: jediná kandidátka 2026; `map-obce.png`: obce pod 500 obyvatel).
2. `node compose.cjs <repo> <out>` – složí `cover.jpg` (1500×1200) a `cover-og.jpg` (1200×630)
   ve stylu série Volby 2026 do `<out>/final/<slug>/`.

Potřebuje Edge (`channel: 'msedge'`) a Google Fonts.
