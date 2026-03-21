function setupDailyCronTrigger() {
    deleteTriggers();

    ScriptApp.newTrigger('dailyCron')
        .timeBased()
        .everyDays(1)
        .atHour(DAILY_CRON_HOUR)
        .create();

    Logger.log('Daily trigger set for ' + DAILY_CRON_HOUR + ' hour');
}

function setupMonthlyCronTrigger() {
    ScriptApp.newTrigger('monthlyCron')
        .timeBased()
        .onMonthDay(25)
        .atHour(DAILY_CRON_HOUR)
        .create();

    Logger.log('Monthly trigger set for 1st of month at ' + DAILY_CRON_HOUR + ' hour');
}

function deleteTriggers() {
    let triggers = ScriptApp.getProjectTriggers();

    for (let i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === 'dailyCron' || triggers[i].getHandlerFunction() === 'monthlyCron') {
            ScriptApp.deleteTrigger(triggers[i]);
        }
    }
}

function dailyCron(){
    updateDailyTracker();
}

function monthlyCron() {
    sendMonthlySummaryEmail();
}
