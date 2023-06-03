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

export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}