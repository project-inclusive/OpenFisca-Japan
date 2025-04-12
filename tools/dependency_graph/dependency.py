"""
Variable同士の依存関係を解析して、関係図として画像に出力
"""

import glob
import importlib
import inspect
import logging
import os
import re

import graphviz
from openfisca_core.variables import Variable

from openfisca_japan import COUNTRY_DIR


# Variable同士の依存関係を解析（継承はせず動的に読み込んでいるためソースコードから推定）
class DependencyFinder:
    def __init__(self, module):
        self.module = module

    def _get_variables(self):
        return {name: c for name, c in inspect.getmembers(self.module, inspect.isclass) if issubclass(c, Variable) and c is not Variable}

    # TODO: add expired formulas
    def _get_formula_method_source(self, cls):
        try:
            for name, method in inspect.getmembers(cls(), inspect.ismethod):
                if name == "formula":
                    return inspect.getsource(method)
        except Exception as e:
            logging.info(f"failed to parse {cls}: {e}")
            return ""

        # if not found
        return ""

    def _get_dependencies(self, source):
        deps = set()
        for line in source.split("\n"):
            dep = self._dependency_from_line(line)
            if dep is not None:
                deps.add(dep)
        return deps

    def _dependency_from_line(self, line):
        if m := re.search(r'対象世帯\.members\("([^"]*)", *対象期間\)', line):
            return m.group(1)

        if m := re.search(r"対象世帯\.members\('([^']*)', *対象期間\)", line):
            return m.group(1)

        if m := re.search(r'対象世帯\("([^"]*)", *対象期間\)', line):
            return m.group(1)

        if m := re.search(r"対象世帯\('([^']*)', *対象期間\)", line):
            return m.group(1)

        if m := re.search(r'対象人物\("([^"]*)", *対象期間\)', line):
            return m.group(1)

        if m := re.search(r"対象人物\('([^']*)', *対象期間\)", line):
            return m.group(1)

        return None

    def get_dependencies(self):
        variables = self._get_variables()
        dependencies = {}

        for name, v in variables.items():
            src = self._get_formula_method_source(v)
            deps = self._get_dependencies(src)
            # 新たに見つかった依存関係を追加
            dependencies[name] = deps

        return dependencies


def show_graph(dependencies):
    """
    依存関係をグラフとして描画し表示
    """
    g = graphviz.Digraph(format="png", filename="dependency_graph", directory=os.path.dirname(__file__))

    # Variableを定義
    for name, deps in dependencies.items():
        color = "#00ffff" if len(deps) == 0 else "#ffffff"
        g.node(name, fillcolor=color, style="filled")

        for d in deps:
            # Variableどうしの依存関係を定義
            g.edge(name, d)

    # 表示
    g.view()


if __name__ == "__main__":
    dependencies = {}

    # openfisca_japanのルートディレクトリ
    root_dir = COUNTRY_DIR

    filenames = glob.glob(f"{root_dir}/**/*.py", recursive=True)
    module_paths = [filename.replace(".py", "").replace("/", ".") for filename in filenames]
    # 動的にファイルをimport
    for path in module_paths:
        module = importlib.import_module(path)
        finder = DependencyFinder(module)
        dependencies = {**dependencies, **finder.get_dependencies()}

    show_graph(dependencies)
