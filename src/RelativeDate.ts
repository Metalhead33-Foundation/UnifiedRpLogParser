export interface Distance {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function decrementDate(date: Date, distance: Distance): Date {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() - distance.years);
    newDate.setMonth(newDate.getMonth() - distance.months);
    newDate.setDate(newDate.getDate() - distance.weeks * 7 - distance.days);
    newDate.setHours(newDate.getHours() - distance.hours);
    newDate.setMinutes(newDate.getMinutes() - distance.minutes);
    newDate.setSeconds(newDate.getSeconds() - distance.seconds);
    return newDate;
}