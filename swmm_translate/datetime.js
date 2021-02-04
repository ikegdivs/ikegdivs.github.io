//-----------------------------------------------------------------------------
//   datetime.h
//
//   Project:  EPA SWMM5
//   Version:  5.1
//   Date:     03/20/14   (Build 5.1.001)
//             08/01/16   (Build 5.1.011)
//   Author:   L. Rossman
//
//   The DateTime type is used to store date and time values. It is
//   equivalent to a double floating point type.
//
//   The integral part of a DateTime value is the number of days that have
//   passed since 12/31/1899. The fractional part of a DateTime value is the
//   fraction of a 24 hour day that has elapsed.
//
//   Build 5.1.011
//   - New getTimeStamp function added.
//-----------------------------------------------------------------------------

//typedef double DateTime;

var Y_M_D = 0
var M_D_Y = 1
var D_M_Y = 2
var NO_DATE = -693594 // 1/1/0001
var DATE_STR_SIZE = 12
var TIME_STR_SIZE = 9

//-----------------------------------------------------------------------------
//   datetime.c
//
//   Project:  EPA SWMM5
//   Version:  5.1
//   Date:     03/20/14   (Build 5.1.001)
//             08/01/16   (Build 5.1.011)
//   Author:   L. Rossman
//
//   DateTime functions.
//
//   Build 5.1.011
//   - decodeTime() no longer rounds up.
//   - New getTimeStamp function added.
//
//-----------------------------------------------------------------------------


// Macro to convert character x to upper case
function UCHAR(x) {
    return x.toUpperCase();
}

//-----------------------------------------------------------------------------
//  Constants
//-----------------------------------------------------------------------------
const MonthTxt =
    ["JAN", "FEB", "MAR", "APR",
     "MAY", "JUN", "JUL", "AUG",
     "SEP", "OCT", "NOV", "DEC"];
const DaysPerMonth =      // days per month
    [[31, 28, 31, 30, 31, 30,               // normal years
      31, 31, 30, 31, 30, 31],
     [31, 29, 31, 30, 31, 30,               // leap years
      31, 31, 30, 31, 30, 31]];
const DateDelta = 693594;        // days since 01/01/00
const SecsPerDay = 86400.;    // seconds per day

//=============================================================================

function divMod(n, d, result, remainder)
//  Input:   n = numerator
//           d = denominator
//  Output:  result = integer part of n/d
//           remainder = remainder of n/d
//  Purpose: finds integer part and remainder of n/d.
{
    if (d == 0)
    {
        result = 0;
        remainder = 0;
    }
    else
    {
        result = n/d;
        remainder = n - d*(result);
    }
}

//=============================================================================

function isLeapYear(year)
//  Input:   year = a year
//  Output:  returns 1 if year is a leap year, 0 if not
//  Purpose: determines if year is a leap year.
{
    if ((year % 4   == 0)
    && ((year % 100 != 0)
    ||  (year % 400 == 0))) return 1;
    else return 0;
}

//=============================================================================

function datetime_findMonth(month)
//  Input:   month = month of year as character string
//  Output:  returns: month of year as a number (1-12)
//  Purpose: finds number (1-12) of month.
{
    let i;
    for (i = 0; i < 12; i++)
    {
        if (UCHAR(month[0]) == MonthTxt[i][0]
        &&  UCHAR(month[1]) == MonthTxt[i][1]
        &&  UCHAR(month[2]) == MonthTxt[i][2]) return i+1;
    }
    return 0;
}

//=============================================================================

function datetime_encodeDate(year, month, day)
//  Input:   year = a year
//           month = a month (1 to 12)
//           day = a day of month
//  Output:  returns encoded value of year-month-day
//  Purpose: encodes year-month-day to a DateTime value.
{
    let i, j;
    i = isLeapYear(year);
    if ((year >= 1)
    && (year <= 9999)
    && (month >= 1)
    && (month <= 12)
    && (day >= 1)
    && (day <= DaysPerMonth[i][month-1]))
    {
        for (j = 0; j < parseInt(month-1); j++) day += DaysPerMonth[i][j];
        i = year - 1;
        return i*365 + i/4 - i/100 + i/400 + parseInt(day) - DateDelta;
    }
    else return -DateDelta;
}

//=============================================================================

function datetime_encodeTime(hour, minute, second)
//  Input:   hour = hour of day (0-24)
//           minute = minute of hour (0-60)
//           second = seconds of minute (0-60)
//  Output:  returns time encoded as fractional part of a day
//  Purpose: encodes hour:minute:second to a DateTime value
{
    let s;
    if ((parseInt(hour) >= 0)
    && (parseInt(minute) >= 0)
    && (parseInt(second) >= 0))
    {
        s = (parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second));
        return s/SecsPerDay;
    }
    else return 0.0;
}

//=============================================================================

function datetime_decodeDate(date, year, month, day)
//  Input:   date = encoded date/time value
//  Output:  year = 4-digit year
//           month = month of year (1-12)
//           day   = day of month
//  Purpose: decodes DateTime value to year-month-day.
{
    let  D1, D4, D100, D400;
    let  y, m, d, i, k, t;

    D1 = 365;              //365
    D4 = D1 * 4 + 1;       //1461
    D100 = D4 * 25 - 1;    //36524
    D400 = D100 * 4 + 1;   //146097

    t = (Math.floor(date)) + DateDelta;
    if (t <= 0)
    {
        year = 0;
        month = 1;
        day = 1;
    }
    else
    {
        t--;
        y = 1;
        while (t >= D400)
        {
            t -= D400;
            y += 400;
        }
        divMod(t, D100, i, d);
        if (i == 4)
        {
            i--;
            d += D100;
        }
        y += i*100;
        divMod(d, D4, i, d);
        y += i*4;
        divMod(d, D1, i, d);
        if (i == 4)
        {
            i--;
            d += D1;
        }
        y += i;
        k = isLeapYear(y);
        m = 1;
        for (;;)
        {
            i = DaysPerMonth[k][m-1];
            if (d < i) break;
            d -= i;
            m++;
        }
        year = y;
        month = m;
        day = d + 1;
    }
}

//=============================================================================

function datetime_decodeTime(time, h, m, s)
//  Input:   time = decimal fraction of a day
//  Output:  h = hour of day (0-23)
//           m = minute of hour (0-59)
//           s = second of minute (0-59)
//  Purpose: decodes DateTime value to hour:minute:second.
{
    let secs;
    let mins;
    let fracDay = (time - Math.floor(time)) * SecsPerDay;
    secs = (Math.floor(fracDay + 0.5));
    if ( secs >= 86400 ) secs = 86399;
    divMod(secs, 60, mins, s);
    divMod(mins, 60, h, m);
    if ( h > 23 ) h = 0;
}

//=============================================================================

function datetime_dateToStr(date, s)
//  Input:   date = encoded date/time value
//  Output:  s = formatted date string
//  Purpose: represents DateTime date value as a formatted string.
{
    let  y, m, d;
    let dateStr = new Array(DATE_STR_SIZE);
    datetime_decodeDate(date, y, m, d);
    switch (DateFormat)
    {
      case Y_M_D:
        //sprintf(dateStr, "%4d-%3s-%02d", y, MonthTxt[m-1], d);
        dateStr = y.toString().padStart(4, "0") 
                    + '-'
                    + MonthTxt[m-1]
                    + '-'
                    + d.toString().padStart(2, "0")
        break;

      case M_D_Y:
        //sprintf(dateStr, "%3s-%02d-%4d", MonthTxt[m-1], d, y);
        //sprintf(dateStr, "%02d/%02d/%04d", m, d, y);
        dateStr = m.toString().padStart(2, "0")
                    + '/'
                    + d.toString().padStart(2, "0")
                    + '/'
                    + y.toString().padStart(4, "0") 
        break;

      default:
        //sprintf(dateStr, "%02d-%3s-%4d", d, MonthTxt[m-1], y);
        dateStr = d.toString().padStart(2, "0")
                    + '-'
                    + MonthTxt[m-1]
                    + '-'
                    + y.toString().padStart(4, "0") 
    }
    s = dateStr;
}

//=============================================================================

function datetime_timeToStr(time, s)
//  Input:   time = decimal fraction of a day
//  Output:  s = time in hr:min:sec format
//  Purpose: represents DateTime time value as a formatted string.
{
    let  hr, min, sec;
    let timeStr;
    datetime_decodeTime(time, hr, min, sec);
    //sprintf(timeStr, "%02d:%02d:%02d", hr, min, sec);
    timeStr = hr.toString().padStart(2, "0")
                + ':'
                + min.toString().padStart(2, "0")
                + ':'
                + sec.toString().padStart(2, "0")
    //strcpy(s, timeStr);
    s = timeStr;
}

//=============================================================================

function datetime_strToDate(s, d)
//  Input:   s = date as string
//  Output:  d = encoded date;
//           returns 1 if conversion successful, 0 if not
//  Purpose: converts string date s to DateTime value.
//
{
    let  yr = 0, mon = 0, day = 0, n;
    let month;
    let sep1, sep2;
    d = -DateDelta;
    //if (strchr(s, '-') || strchr(s, '/'))
    if (s.includes('-') || s.includes('/'))
    {
        switch (DateFormat)
        {
          case Y_M_D:
            // Scan string s for the year, month, and day
            //n = sscanf(s, "%d%c%d%c%d", &yr, &sep1, &mon, &sep2, &day);
            vals = s.split(/[-//]+/)
            n = vals.length
            yr = vals[0]
            mon = vals[1]
            day = vals[2]
            if ( n < 3 )
            {
                return 0;
            }
            break;

          case D_M_Y:
            //n = sscanf(s, "%d%c%d%c%d", day, sep1, mon, sep2, yr);
            vals = s.split(/[-//]+/)
            n = vals.length
            yr = vals[2]
            mon = vals[1]
            day = vals[0]
            if ( n < 3 )
            {
                return 0;
            }
            break;

          default: // M_D_Y
            //n = sscanf(s, "%d%c%d%c%d", mon, sep1, day, sep2, yr);
            vals = s.split(/[-//]+/)
            n = vals.length
            yr = vals[2]
            mon = vals[0]
            day = vals[1]
            if ( n < 3 )
            {
                return 0;
            }
            break;
        }
        if (!(/\d/.test(mon))) mon = datetime_findMonth(month);
        d = datetime_encodeDate(yr, mon, day);
        return d;
    }
    if (d == -DateDelta) return 0;
    else return null;
}

//=============================================================================

function datetime_strToTime(s, t)
//  Input:   s = time as string
//  Output:  t = encoded time,
//           returns 1 if conversion successful, 0 if not
//  Purpose: converts a string time to a DateTime value.
//  Note:    accepts time as hr:min:sec or as decimal hours.
{
    let  n, hr, min = 0, sec = 0;

    // Attempt to read time as decimal hours
    t = parseInt(s);
    if ( t == NaN )
    {
        t = 0;
        return t;
    }

    // Read time in hr:min:sec format
    t = 0.0;
    //n = sscanf(s, "%d:%d:%d", &hr, &min, &sec);
    vals = s.split(/[:]+/)
            n = vals.length
            hr = vals[0]
            min = vals[1]
            sec = vals[2]
    if ( n == 0 ) return 0;
    t = datetime_encodeTime(hr, min, sec);
    if ( (hr >= 0) && (min >= 0) && (sec >= 0) ) return t;
    else return null;
}

//=============================================================================

function datetime_setDateFormat(fmt)
//  Input:   fmt = date format code
//  Output:  none
//  Purpose: sets date format
{
    if ( fmt >= Y_M_D && fmt <= M_D_Y) DateFormat = fmt;
}

//=============================================================================

function datetime_addSeconds(date1, seconds)
//  Input:   date1 = an encoded date/time value
//           seconds = number of seconds to add to date1
//  Output:  returns updated value of date1
//  Purpose: adds a given number of seconds to a date/time.
{
    let d = Math.floor(date1);
    let h, m, s;
    datetime_decodeTime(date1, h, m, s);
    return d + (3600.0*h + 60.0*m + s + seconds)/SecsPerDay;
}

//=============================================================================

function datetime_addDays(date1, date2)
//  Input:   date1 = an encoded date/time value
//           date2 = decimal days to be added to date1
//  Output:  returns date1 + date2
//  Purpose: adds a given number of decimal days to a date/time.
{
    let d1 = Math.floor(date1);
    let d2 = Math.floor(date2);
    let h1, m1, s1;
    let h2, m2, s2;
    datetime_decodeTime(date1, h1, m1, s1);
    datetime_decodeTime(date2, h2, m2, s2);
    return d1 + d2 + datetime_encodeTime(h1+h2, m1+m2, s1+s2);
}

//=============================================================================

function datetime_timeDiff(date1, date2)
//  Input:   date1 = an encoded date/time value
//           date2 = an encoded date/time value
//  Output:  returns date1 - date2 in seconds
//  Purpose: finds number of seconds between two dates.
{
    let d1 = Math.floor(date1);
    let d2 = Math.floor(date2);
    let    h, m, s;
    let   s1, s2, secs;
    datetime_decodeTime(date1, h, m, s);
    s1 = 3600*h + 60*m + s;
    datetime_decodeTime(date2, h, m, s);
    s2 = 3600*h + 60*m + s;
    secs = (Math.floor((d1 - d2)*SecsPerDay + 0.5));
    secs += (s1 - s2);
    return secs;
}

//=============================================================================

function  datetime_monthOfYear(date)
//  Input:   date = an encoded date/time value
//  Output:  returns index of month of year (1..12)
//  Purpose: finds month of year (Jan = 1 ...) for a given date.
{
    let year, month, day;
    datetime_decodeDate(date, year, month, day);
    return month;
}

//=============================================================================

function  datetime_dayOfYear(date)
//  Input:   date = an encoded date/time value
//  Output:  returns day of year (1..365)
//  Purpose: finds day of year (Jan 1 = 1) for a given date.
{
    let year, month, day;
    let startOfYear;
    datetime_decodeDate(date, year, month, day);
    startOfYear = datetime_encodeDate(year, 1, 1);
    return (Math.floor(date - startOfYear)) + 1;
}

//=============================================================================

function datetime_dayOfWeek(date)
//  Input:   date = an encoded date/time value
//  Output:  returns index of day of week (1..7)
//  Purpose: finds day of week (Sun = 1, ... Sat = 7) for a given date.
{
    let t = (Math.floor(date)) + DateDelta;
    return (t % 7) + 1;
}

//=============================================================================

function  datetime_hourOfDay(date)
//  Input:   date = an encoded date/time value
//  Output:  returns hour of day (0..23)
//  Purpose: finds hour of day (0 = 12 AM, ..., 23 = 11 PM) for a given date.
{
    let hour, min, sec;
    datetime_decodeTime(date, hour, min, sec);
    return hour;
}

//=============================================================================

function  datetime_daysPerMonth(year, month)
//  Input:   year = year in which month falls
//           month = month of year (1..12)
//  Output:  returns number of days in the month
//  Purpose: finds number of days in a given month of a specified year.
{
    if ( month < 1 || month > 12 ) return 0;
    return DaysPerMonth[isLeapYear(year)][month-1];
}

//=============================================================================

function datetime_getTimeStamp(fmt, aDate, stampSize, timeStamp)

//  Input:   fmt = desired date format code
//           aDate = a date/time value in decimal days
//           stampSize = the number of bytes allocated for the time stamp
//  Output:  returns a time stamp string (e.g., Year-Month-Day Hr:Min:Sec)
//  Purpose: Expresses a decimal day date by a time stamp.
{
    let dateStr;
    let timeStr;
    let oldDateFormat = DateFormat;
    
    if ( stampSize < DATE_STR_SIZE + TIME_STR_SIZE + 2 ) return;
    datetime_setDateFormat(fmt);     
    datetime_dateToStr(aDate, dateStr);
    DateFormat = oldDateFormat;
    datetime_timeToStr(aDate, timeStr);
    //sprintf(timeStamp, "%s %s", dateStr, timeStr);
    timeStamp = dateStr + ' ' + timeStr;
}
