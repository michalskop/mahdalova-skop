# tools/media – ffmpeg pro animace a videa

Lokální nástroj, **nic z toho nejde na web**. Složka je záměrně mimo npm workspaces: Cloudflare Pages ji při deployi neinstaluje, takže výpadek stahování ffmpeg nemůže shodit nasazení webu.

- Instalace (jednou v každé kopii repa / worktree): `cd tools/media && npm install`
- Pevná verze `ffmpeg-static` 5.3.0 (ffmpeg 6.1.1, release b6.1.1), bez automatických aktualizací.
- `postinstall` spustí `verify-ffmpeg.cjs`: porovná SHA256 binárky s otiskem zveřejněným na GitHubu; při neshodě binárku smaže a skončí chybou. Ručně: `npm run verify`.
- Otisk je zatím zapsaný jen pro Windows x64. Jiná platforma (Michal) → doplnit otisk z releasu b6.1.1 (`gh api repos/eugeneware/ffmpeg-static/releases/tags/b6.1.1`), jinak kontrola selže.
- Binárka je v `node_modules`, do gitu se nedostane.
- Změna verze = vědomé rozhodnutí: nová verze v `package.json` + nový otisk ve `verify-ffmpeg.cjs`, schvaluje Kateřina.
