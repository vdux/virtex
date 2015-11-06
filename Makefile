#
# Vars
#

BIN = ./node_modules/.bin
.DEFAULT_GOAL := all

src = $(shell find src/*.js)
tests = $(shell find test/**/*.js)

#
# Tasks
#

node_modules: package.json
	@npm install
	@touch node_modules

test: $(src) $(tests)
	@NODE_ENV=development hihat test/index.js -- \
		--debug \
		-t babelify \
		-t envify \
		-p tap-dev-tool

validate: node_modules
	@${BIN}/standard

all: validate test

#
# Phony
#

.PHONY: test validate
