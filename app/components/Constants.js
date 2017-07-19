var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');

export const REQUEST_PLACES_URL =  'http://clubbinrd.com/api/places?time=' + moment().unix() + '&city=';
export const REQUEST_ACTIVITIES_URL =  'http://clubbinrd.com/api/activities?time=' + moment().unix()  + '&city=';