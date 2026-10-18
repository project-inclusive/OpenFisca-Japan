# docs は同名のディレクトリ docs/ が存在するため、宣言しないと
# 「更新済み」と判定されてレシピが実行されない
.PHONY: docs check-docs serve-docs stop-docs

all: clean build test

uninstall:
	pip freeze | grep -v "^-e" | xargs pip uninstall -y

clean:
	rm -rf build dist
	find . -name '*.pyc' -exec rm \{\} \;

deps:
	@# pip install --upgrade pip build twine
	pip install build==0.10.0 twine==4.0.2

install: deps
	@# Install OpenFisca-Extension-Template for development.
	@# `make install` installs the editable version of OpenFisca-Japan.
	@# This allows contributors to test as they code.
	pip install -e '.[dev]' --upgrade --use-deprecated=legacy-resolver

build: deps
	@# Install OpenFisca-Extension-Template for deployment and publishing.
	@# `make build` allows us to be be sure tests are run against the packaged version
	@# of OpenFisca-Extension-Template, the same we put in the hands of users and reusers.
	python -m build
	find dist -name "*.whl" -exec pip install --force-reinstall {}[dev] \;

check-syntax-errors:
	python -m compileall -q .

format-style: encode-jananese-filename
	@# Do not analyse .gitignored files.
	@# `make` needs `$$` to output `$`. Ref: http://stackoverflow.com/questions/2382764.
	autopep8 `git ls-files | grep "\.py$$"`

check-style: encode-jananese-filename
	@# Do not analyse .gitignored files and simulation folder.
	@# `make` needs `$$` to output `$`. Ref: http://stackoverflow.com/questions/2382764.
	flake8 --exclude=simulation/sample.py `git ls-files | grep "\.py$$"`
	@# check variables meet openfisca coding style
	@# `grep` cannot be used here because it ignores Japanese file names.
	ruff check

lint: clean check-syntax-errors check-style

test:
	openfisca test --country-package openfisca_japan openfisca_japan/tests

docs:
	@# 制度(Variable)・パラメータ(Parameter)のメタデータを docs/_data/ に生成する。
	@# 生成物はコミットする(GitHub Pages のビルドではプラグインを追加できないため)。
	python tools/make_docs/make_docs.py

check-docs: docs
	@# 生成物がソースと乖離していないかを確認する(CI用)。
	git diff --exit-code -- docs/_data

serve-docs: docs
	@# docs/ の Jekyll サイトを http://localhost:4000 でプレビューする。
	@# 初回はイメージのビルドに数分かかる。docs/ を編集したら stop-docs → serve-docs で反映する
	@# (バインドマウント越しではファイル変更が検知されないため --watch は効かない)。
	docker compose --profile docs up -d --build docs
	@echo "http://localhost:4000/ で確認できます (停止: make stop-docs)"

stop-docs:
	docker compose --profile docs down docs

serve-local:
	openfisca serve --country-package openfisca_japan --bind 0.0.0.0:50000

serve-public:
	openfisca serve --country-package openfisca_japan --bind 0.0.0.0:8080

calc:
	curl -s -X POST -H "Content-Type: application/json" -d @calculate_api_example.json http://localhost:50000/calculate | jq .

encode-jananese-filename:
	@# disable Japanese filename escape (by default Japanese characters are printed as `\346\211\200\345\276\227.py`)
	git config --local core.quotepath false
