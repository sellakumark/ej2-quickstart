import { Schedule, Day, Week, WorkWeek, Month, Agenda } from '@syncfusion/ej2-schedule';

Schedule.Inject(Day, Week, WorkWeek, Month, Agenda);

let scheduleObj: Schedule = new Schedule({ height: 500 });
scheduleObj.appendTo('#Schedule');