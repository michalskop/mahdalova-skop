# Volební večer: každé 3 minuty stáhne odhad z dashboardu a při změně ho commitne a pushne na main.
# python auto_odhad.py   (běží, dokud se neukončí; web se nasadí po každém pushi)
import os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", "..", ".."))
REL = os.path.relpath(os.path.join(HERE, "odhad.json"), REPO).replace("\\", "/")
INTERVAL = int(sys.argv[1]) if len(sys.argv) > 1 else 180

def git(*a):
    return subprocess.run(["git", "-C", REPO, *a], capture_output=True, text=True, encoding="utf-8")

while True:
    subprocess.run([sys.executable, os.path.join(HERE, "aktualizuj_odhad.py")], capture_output=True)
    if git("diff", "--quiet", "--", REL).returncode:
        git("add", REL)
        git("commit", "-q", "-m", "data(volby 2026 predikce): automatická aktualizace odhadu")
        git("fetch", "-q", "origin")
        git("merge", "-q", "origin/main", "-m", "Merge origin/main")
        r = git("push", "-q", "origin", "HEAD:main")
        print(time.strftime("%H:%M:%S"), "push", "OK" if r.returncode == 0 else r.stderr.strip()[:200], flush=True)
    else:
        print(time.strftime("%H:%M:%S"), "beze změny", flush=True)
    time.sleep(INTERVAL)
