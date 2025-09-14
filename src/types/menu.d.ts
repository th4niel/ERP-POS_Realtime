export type MenuFormState = {
  status?: string;
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    price?: string[];
    discount?: string[];
    category?: string[];
    is_available?: string[];
    image_url?: string[];
    _form?: string[];
  };
};