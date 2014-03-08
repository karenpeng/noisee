TESTS = $(shell ls -S `find test -type f -name "*.js" -print`)
TIMEOUT = 1000
MOCHA_OPTS =
REPORTER = spec
JSCOVERAGE = ./node_modules/jscover/bin/jscover

install:
	@npm install

test: install
	@NODE_ENV=test node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TIMEOUT) $(MOCHA_OPTS) $(TESTS)

test-cov: lib-cov
	@RESPONSE_PATCH_COV=1 $(MAKE) test REPORTER=dot
	@RESPONSE_PATCH_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov: install
	@rm -rf $@
	@$(JSCOVERAGE) lib $@

.PHONY: lib-cov test test-cov

