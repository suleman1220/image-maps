import Pin from '../assets/images/pin.png';
import DrawingPin from '../assets/images/drawing-pin.png';
import Marker from '../assets/images/marker.png';
import RightArrow from '../assets/images/right-arrow.png';

export const $ = window.$;

export const IMG_MAP = {
  'right-arrow': RightArrow,
  'drawing-pin': DrawingPin,
  marker: Marker,
  pin: Pin,
};

export const ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

export const API_URL = 'http://localhost:5000';
