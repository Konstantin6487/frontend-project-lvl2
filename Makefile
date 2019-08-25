install: install-deps

run:
	npx babel-node 'src/bin/gendiff.js' $(file) $(file2)

install-deps:
	npm install

build:
	rm -rf dist
	npm run build

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test