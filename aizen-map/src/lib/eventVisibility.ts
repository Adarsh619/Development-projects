import {dateOffset,localISODate,type Listing} from './listings';

// Bengaluru does not observe daylight saving time; its UTC offset is always +05:30.
const IST_OFFSET_MS=330*60_000;

function eventStartMs(date:string,time:string):number|null{
 const day=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
 const clock=/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
 if(!day||!clock)return null;
 const [,yearText,monthText,dayText]=day;
 const year=Number(yearText),month=Number(monthText),dayOfMonth=Number(dayText);
 const hour12=Number(clock[1]),minute=Number(clock[2]);
 if(hour12<1||hour12>12||minute>59)return null;
 const calendarDay=new Date(Date.UTC(year,month-1,dayOfMonth));
 if(calendarDay.getUTCFullYear()!==year||calendarDay.getUTCMonth()!==month-1||calendarDay.getUTCDate()!==dayOfMonth)return null;
 const hour=hour12%12+(clock[3].toUpperCase()==='PM'?12:0);
 return Date.UTC(year,month-1,dayOfMonth,hour,minute)-IST_OFFSET_MS;
}

export function isVisibleListing(listing:Listing,nowMs:number):boolean{
 if(!listing.date)return true; // Permanent venues and branch-finder shortcuts stay visible.
 if(!listing.time)return false;
 const start=eventStartMs(listing.date,listing.time);
 if(start===null)return false;
 const end=listing.verifiedEndAt&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(listing.verifiedEndAt)
  ?Date.parse(listing.verifiedEndAt):NaN;
 const inProgress=Number.isFinite(end)&&end>start&&end>nowMs&&start<=nowMs;
 if(!inProgress&&start<=nowMs)return false;
 return listing.date<=dateOffset(2,new Date(nowMs))&&(inProgress||listing.date>=localISODate(new Date(nowMs)));
}
