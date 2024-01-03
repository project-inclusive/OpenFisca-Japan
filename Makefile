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
	@# `make install` installs the editable version of OpenFisca-France.
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
	@# Do not analyse .gitignored files.
	@# `make` needs `$$` to output `$`. Ref: http://stackoverflow.com/questions/2382764.
	flake8 `git ls-files | grep "\.py$$"`
	pylint `git ls-files | grep "\.py$$"`
	@# check variables meet openfisca coding style
	@# `grep` cannot be used here because it ignores Japanese file names.
	ruff check

lint: clean check-syntax-errors check-style

test:
	openfisca test --country-package openfisca_japan openfisca_japan/tests

serve-local:
	openfisca serve --country-package openfisca_japan --bind 0.0.0.0:50000

serve-public:
	openfisca serve --country-package openfisca_japan --bind 0.0.0.0:8080

calc:
	curl -s -X POST -H "Content-Type: application/json" -d @calculate_api_example.json http://localhost:50000/calculate | jq .

encode-jananese-filename:
	@# disable Japanese filename escape (by default Japanese characters are printed as `\346\211\200\345\276\227.py`)
	git config --local core.quotepath false
