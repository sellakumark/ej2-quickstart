describe('Schedule', function () {
    it('view navigation testing', async function () {
        await browser.get('http://localhost:3000/index.html');
        await browser.sleep(10000);
        var activeElement = element(by.css('.e-active-view'));
        expect(activeElement.classList.contains('e-week')).toEqual(true);
        expect(activeElement.classList.contains('e-month')).toEqual(false);
        browser.compareScreen(element(By.className('e-schedule')), 'week');

        await browser.actions().click(browser.findElement(by.xpath('//*[@id="Schedule"]/div[1]/div/div/div[3]/div[6]'))).perform();
        await browser.sleep(10000);
        activeElement = element(by.css('.e-active-view'));
        expect(activeElement.classList.contains('e-week')).toEqual(false);
        expect(activeElement.classList.contains('e-month')).toEqual(true);
        browser.compareScreen(element(By.className('e-schedule')), 'week');
    });
});