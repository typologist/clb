var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');

export const REQUEST_CITIES_URL =  'http://clubbinrd.com/api/cities';
export const REQUEST_PLACES_URL =  'http://clubbinrd.com/api/places?city=';
export const REQUEST_ACTIVITIES_URL =  'http://clubbinrd.com/api/activities?city=';