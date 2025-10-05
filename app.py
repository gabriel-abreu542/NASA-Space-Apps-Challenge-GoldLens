import os
import runpy

# Caminho para o main.py dentro da pasta backend
backend_main = os.path.join(os.path.dirname(__file__), "backend", "main.py")

# Executa o conteúdo do main.py
runpy.run_path(backend_main, run_name="__main__")
