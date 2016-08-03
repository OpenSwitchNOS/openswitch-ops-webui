
build:
	mkdir -p compiled build
	cp ../src/shared/assets/exo-*.woff build/
	cp include/style.css build/
	node ../node_modules/.bin/webfont-inliner build/style.css -o build/style-inlined.css
	../node_modules/.bin/cleancss -o compiled/style.css.html build/style-inlined.css
	../node_modules/.bin/metalsmith

.PHONY: build
