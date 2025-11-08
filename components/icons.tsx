import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
  </svg>
);

export const ShoppingCartIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.838-5.513a1.875 1.875 0 00-1.087-2.336H6.61a1.875 1.875 0 00-1.087 2.336L7.5 14.25zM10.5 8.25h9M15.75 15a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const StoreIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.75c.414 0 .75.336.75.75v7.5m0 0H18M15 21h-3.75m.75-12.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm-3-6h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm-3-6h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zM6.75 8.25h.008v.008h-.008V8.25zm-3 3h.008v.008h-.008v-.008zM3.75 12h.008v.008h-.008V12m-2.25 8.25v-1.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 18.75v1.5M16.5 3.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zm-3.75 0a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zm-3.75 0a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.654 4.505 1.93 6.344l-1.225 4.485 4.635-1.218zM8.332 9.55c-.27-.124-.62-.247-.905-.371-.285-.124-.59-.125-.795.125-.206.25-.791.935-.964 1.139-.173.204-.347.229-.622.124-.275-.105-1.16-1.033-2.205-2.046h-.012c-.595-.597-1.033-1.346-1.226-1.77-.193-.424-.04-.66.12-.834.148-.16.315-.246.47-.371.155-.125.206-.125.304-.25.098-.125.048-.247-.024-.371-.07-.125-.67-1.62-.917-2.207-.245-.586-.49-.506-.67.507-.18.001-.395.001-.57-.001-.176 0-.448.074-.67.371-.22.297-.84.834-.84 2.045 0 1.21.865 2.364.99 2.515.124.15 1.77 2.692 4.275 3.797 2.504 1.106 2.807.892 3.32.862.512-.03 1.67-.683 1.913-1.34.243-.656.243-1.21.172-1.34-.07-.124-.27-.187-.57-.311z"></path>
    </svg>
);

export const MessageIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
    </svg>
);
