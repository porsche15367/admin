export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/admin-dashboard',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'management',
    title: 'Management',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'vendor-management',
        title: 'Vendor Management',
        type: 'item',
        classes: 'nav-item',
        url: '/vendor-management',
        icon: 'shop',
        breadcrumbs: false
      },
      {
        id: 'order-management',
        title: 'Order Management',
        type: 'item',
        classes: 'nav-item',
        url: '/order-management',
        icon: 'shopping-cart',
        breadcrumbs: false
      },
      {
        id: 'vendor-approval',
        title: 'Vendor Approval',
        type: 'item',
        classes: 'nav-item',
        url: '/vendor-approval',
        icon: 'check-circle',
        breadcrumbs: false
      },
      {
        id: 'user-management',
        title: 'User Management',
        type: 'item',
        classes: 'nav-item',
        url: '/user-management',
        icon: 'user',
        breadcrumbs: false
      }
    ]
  }
];
