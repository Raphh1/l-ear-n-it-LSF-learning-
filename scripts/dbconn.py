"""Exécute une requête SQL via psql, connexion lue depuis appsettings.Development.json (aucun secret en dur)."""
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "lsf-api" / "appsettings.Development.json"


def _conn() -> dict:
    cs = json.loads(CONFIG.read_text())["ConnectionStrings"]["Default"]
    return dict(kv.split("=", 1) for kv in cs.split(";") if kv)


def psql(sql: str) -> str:
    """Retourne la sortie brute (-At) de la requête. Arguments passés en liste, pas de shell."""
    c = _conn()
    env = {**os.environ, "PGPASSWORD": c["Password"]}
    out = subprocess.run(
        ["psql", "-h", c["Host"], "-p", c["Port"], "-U", c["Username"], "-d", c["Database"], "-At", "-v", "ON_ERROR_STOP=1", "-c", sql],
        env=env, check=True, capture_output=True, text=True,
    )
    return out.stdout
