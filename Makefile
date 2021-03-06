dev:
	docker run -it --rm -v $$PWD:/app -p 5000:5000 ruphin/webdev npm run dev
.PHONY: dev

shell:
	docker run -it --rm -v $$PWD:/app ruphin/webdev bash
.PHONY: shell

build:
	docker run -it --rm -v $$PWD:/app ruphin/webdev npm run build
.PHONY: build

publish:
	docker run -v $$PWD:/app \
						 -v $$HOME/.gitconfig:/home/app/.gitconfig \
						 -v $$HOME/.npmrc:/home/app/.npmrc \
						 -v $$HOME/.ssh:/home/app/.ssh \
						 -it --rm ruphin/webdev npm run release
.PHONY: publish
