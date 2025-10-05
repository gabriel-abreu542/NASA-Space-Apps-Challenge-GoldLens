#!/usr/bin/env python3
"""
Script de pré‑processamento para conjuntos de exoplanetas (KOI, K2 e TOI).

Esta ferramenta aplica o pré‑processamento definido em ``ExoPreprocessor`` ao(s)
arquivo(s) CSV fornecidos, gerando splits de treino, validação e candidatos
para cada catálogo separado.  Ela foi projetada para suportar todas as
missões (Kepler KOI, K2 e TESS TOI) e permite processar um único arquivo ou
qualquer combinação deles em uma única execução.

O ``ExoPreprocessor`` (importado de ``exo_preprocess.py``) lida com a
identificação da missão e com as peculiaridades de cada catálogo: remove
identificadores/comentários, descarta colunas vazias ou de baixa variância,
converte valores textuais para numérico, imputa faltantes, mapeia as
disposições para rótulos 0/1/2 e separa as classes 0 e 1 para treino/validação,
deixando os candidatos (classe 2) para predição posterior.

Uso básico:

    python tratamento.py --csv_paths KOIFULL.csv

Para processar vários catálogos de uma vez (por exemplo KOI e K2):

    python tratamento.py --csv_paths KOIFULL.csv,K2FULL.csv

Parâmetros opcionais permitem ajustar o corte de nulos e o tamanho do
conjunto de validação e escolher a pasta de saída.

Exemplo completo:

    python tratamento.py --csv_paths KOIFULL.csv,K2FULL.csv,TOIFULL.csv \
        --null_cut 0.80 --test_size 0.20 --out_dir processed

Isso gerará arquivos como ``processed/KOIFULL_train.csv``,
``processed/K2FULL_valid.csv``, etc. (um trio para cada base) e um
``*_meta.json`` com metadados úteis (colunas mantidas, tamanhos, etc.).

Autor: ChatGPT
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import pandas as pd
from exo_preprocess import ExoPreprocessor



def process_dataset(
    csv_path: Path,
    out_dir: Path,
    null_cut: float,
    test_size: float,
    random_state: int = 42,
) -> None:
    """Processa um único arquivo CSV e salva os conjuntos tratados.

    Parameters
    ----------
    csv_path : Path
        Caminho para o arquivo CSV bruto (KOI, K2 ou TOI).
    out_dir : Path
        Pasta de destino para salvar os arquivos de saída.
    null_cut : float
        Fração máxima de valores nulos permitida por coluna.
    test_size : float
        Proporção de validação dentro das classes binárias.
    random_state : int
        Semente para o split estratificado.
    """
    base = csv_path.stem.upper()
    raw = pd.read_csv(csv_path, comment="#")
    pre = ExoPreprocessor(null_pct_cut=null_cut, test_size=test_size, random_state=random_state)
    X_tr, y_tr, X_va, y_va, cands = pre.fit_and_split(raw)

    # Cria pasta de saída se não existir
    out_dir.mkdir(parents=True, exist_ok=True)

    # Salva conjuntos
    train_df = X_tr.copy()
    train_df["label"] = y_tr.values
    valid_df = X_va.copy()
    valid_df["label"] = y_va.values
    train_df.to_csv(out_dir / f"{base}_train.csv", index=False)
    valid_df.to_csv(out_dir / f"{base}_valid.csv", index=False)
    cands.to_csv(out_dir / f"{base}_candidates.csv", index=False)

    # Salva metadados
    meta = {
        "kept_columns": pre.kept_columns_,
        "mission": pre.mission_,
        "n_train": len(train_df),
        "n_valid": len(valid_df),
        "n_candidates": len(cands),
        "null_cut": null_cut,
        "test_size": test_size,
    }
    with open(out_dir / f"{base}_meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    # Imprime resumo
    print(f"Processado '{csv_path}':")
    print(f"  Missão detectada: {pre.mission_}")
    print(f"  Atributos mantidos: {len(pre.kept_columns_)}")
    print(f"  Tamanho treino (0/1): {len(train_df)} registros")
    print(f"  Tamanho validação: {len(valid_df)} registros")
    print(f"  Tamanho candidatos (classe 2): {len(cands)} registros")
    print(f"  Arquivos salvos em: {out_dir.resolve()}")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Pré‑processa arquivos exoplanetários (KOI, K2, TOI) usando ExoPreprocessor "
            "e salva os splits de treino, validação e candidatos."
        )
    )
    parser.add_argument(
        "--csv_paths",
        required=True,
        help=(
            "Lista de caminhos para arquivos CSV separados por vírgula. "
            "Cada arquivo será processado individualmente."
        ),
    )
    parser.add_argument(
        "--null_cut",
        type=float,
        default=0.80,
        help=(
            "Fração máxima de valores nulos permitida por coluna (default 0.80)."
        ),
    )
    parser.add_argument(
        "--test_size",
        type=float,
        default=0.20,
        help=(
            "Proporção de validação para classes binárias (default 0.20)."
        ),
    )
    parser.add_argument(
        "--out_dir",
        type=str,
        default="processed",
        help=(
            "Pasta onde os arquivos tratados serão salvos (default 'processed')."
        ),
    )
    parser.add_argument(
        "--random_state",
        type=int,
        default=42,
        help="Semente para o split estratificado (default 42).",
    )
    args = parser.parse_args()

    # Parsea lista de arquivos
    csv_list = [p.strip() for p in args.csv_paths.split(",") if p.strip()]
    if not csv_list:
        raise ValueError("Nenhum arquivo CSV especificado.")

    out_dir = Path(args.out_dir)

    # Processa cada arquivo separadamente
    for csv_path_str in csv_list:
        csv_path = Path(csv_path_str)
        if not csv_path.is_file():
            print(f"[AVISO] Arquivo '{csv_path}' não encontrado, ignorando.")
            continue
        process_dataset(
            csv_path=csv_path,
            out_dir=out_dir,
            null_cut=args.null_cut,
            test_size=args.test_size,
            random_state=args.random_state,
        )


if __name__ == "__main__":
    main()