var shell = require('shelljs');
var camelCase = require('pix-diff/lib/camelCase.js');

exports.config = {

    allScriptsTimeout: 600000,

    getPageTimeout: 60000,

    multiCapabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
            'args': ['no-sandbox']
        }
    },

    framework: 'jasmine',

    seleniumAddress: 'http://localhost:4444/wd/hub',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        grep: 'pattern',
        invertGrep: false,
        print: function () { },
        showColors: true
    },

    specs: ['./tests/*.spec.js'],

    onPrepare: function () {
        var fs = require('fs');
        var path = require('path');
        var PixDiff = require('pix-diff');
        browser.isDesktop = true;
        browser.driver.manage().window().maximize();
        browser.driver.manage().window().setPosition(0, 0);
        var JSONReporter = require('jasmine-json-test-reporter');
        jasmine.getEnv().addReporter(new JSONReporter({
            file: 'e2e/jasmine-test-results.json',
            beautify: true,
            indentationLevel: 4
        }));

        browser.getCapabilities().then(function (cap) {

            browser.browserName = cap.get('browserName');

            browser.pixResult = PixDiff;

            browser.pixDiff = new PixDiff({ basePath: './e2e', diffPath: './e2e', formatImageName: '{tag}' });

            browser.pixDiff.diffPath = path.normalize(camelCase('./e2e/Diff/' + browser.browserName));

            createF(browser.pixDiff.diffPath);

            browser.compareScreen = function (element, fileName, opt) {
                var folderName = fileName;
                var fArr = fileName.split('/');
                if (fArr.length > 1) {
                    fArr.splice(-1, 1);
                    folderName = fArr.join('/');
                    createF(camelCase('e2e/expected/' + browser.pixDiff.browserName + '/' + folderName));
                    createF(camelCase('e2e/actual/' + browser.pixDiff.browserName + '/' + folderName));
                }
                var option = {
                    imageAPath: '/expected/' + browser.pixDiff.browserName + '/' + fileName,
                    imageBPath: '/actual/' + browser.pixDiff.browserName + '/' + fileName,
                    filter: ['grayScale'],
                    debug: true,
                    hideShift: true,
                };
                var doneFn = arguments[arguments.length - 1];
                if (typeof opt === 'object' && Object.keys(opt).length) {
                    Object.assign(option, opt);
                }
                browser.pixDiff.saveRegion(element, '/Actual/' + browser.pixDiff.browserName + '/' + fileName, option).then(function () {
                    var fPathName = path.resolve(__dirname, '../../../../' + camelCase('e2e/expected/' + browser.pixDiff.browserName + '/' + fileName) + '.png');
                    if (!fs.existsSync(fPathName) && fs.existsSync(fPathName.replace("Expected", "Actual"))) {
                        fs.copyFileSync(fPathName.replace("Expected", "Actual"), fPathName);
                        console.log('Expected Image Created : /expected/' + browser.pixDiff.browserName + '/' + fileName);
                    }
                    browser.saveCheckImage(element, fileName, option, doneFn);
                });
            };

            browser.saveCheckImage = function (element, fileName, option, doneFn) {
                browser.pixDiff.checkRegion(element, '/Expected/' + browser.pixDiff.browserName + '/' + fileName, option).then(function (result) {
                    // *  - `RESULT_UNKNOWN`: 0
                    // *  - `RESULT_DIFFERENT`: 1
                    // *  - `RESULT_SIMILAR`: 7
                    // *  - `RESULT_IDENTICAL`: 5
                    console.log(JSON.stringify(result));
                    expect(result.code).toEqual(browser.pixResult.RESULT_IDENTICAL);
                    if (typeof doneFn === 'function') {
                        doneFn();
                    }
                });
            };

            browser.waitForEvent = function (id, moduleName, eventName) {
                return browser.executeAsyncScript(function (id, moduleName, eventName, callback) {
                    var instances = document.getElementById(id).ej2_instances;
                    var instanceObj;
                    for (var i = 0; instances && i < instances.length; i++) {
                        if (instances[i].getModuleName() == moduleName) {
                            instanceObj = instances[i];
                        }
                    }
                    if (instanceObj) {
                        var handler = function (e) {
                            instanceObj.removeEventListener(eventName, handler);
                            callback();
                        };
                        instanceObj.addEventListener(eventName, handler);
                    } else {
                        callback();
                    }
                }, id, moduleName, eventName);
            };

            browser.injectScript = function (path, callback) {
                return browser.executeAsyncScript(function (path) {
                    var head = document.getElementsByTagName('head')[0];
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.onload = function () { callback(); };
                    script.src = path;
                    head.appendChild(script);
                }, browser.basePath + path);
            };

            browser.injectCss = function (content) {
                return browser.wait(browser.executeScript(`
                    var style = document.createElement('style');
                    style.id = 'browsercss';
                    if (style.styleSheet) {style.styleSheet.cssText = '` + content + `';}
                    else{style.appendChild(document.createTextNode('` + content + `'));}
                    document.head.appendChild(style);
                `));
            };
        });
    },

    onComplete: function () {
        browser.driver.quit();
    }
};

function createF(path) {
    shell.mkdir('-p', path);
}
