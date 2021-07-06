export const paths = (path: string) => [
  `${path}/*`,
  `!${path}/buildtrees`,
  `!${path}/downloads`,
  `!${path}/installed`,
  `!${path}/packages`,
];
