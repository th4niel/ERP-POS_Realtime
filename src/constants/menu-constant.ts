export const HEADER_TABLE_MENU = [
    'No', 
    'Name', 
    'Category', 
    'Price',
    'Available',
    'Action',
];


export const CATEGORY_LIST = [
  {
  value: 'coffee',
  label: 'Coffee',
  },
  {
  value: 'tea',
  label: 'Tea',
  },
  {
  value: 'pastries',
  label: 'Pastries',
  },
  {
  value: 'sandwiches',
  label: 'Sandwiches',
  },
];

export const AVAILABILITY_LIST = [
  {
  value: 'true',
  label: 'Available',
  },
  {
  value: 'false',
  label: 'Not Available',
  },
];

export const INITIAL_MENU = {
  name: '',
  description: '',
  price: '',
  discount: '',
  category: '',
  image_url: '',
  is_available: '',
};

export const INITIAL_STATE_MENU = {
  status: 'idle',
  errors: {
    id: [],
    name: [],
    description: [],
    price: [],
    discount: [],
    category: [],
    is_available: [],
    image_url: [],
    _form: [],
  },
};