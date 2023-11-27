/* eslint-disable  */
// @ts-ignore
import { colorize } from '@lsk4/colors';

const logo = `
__      $    _______.$ __  ___ $          __       _______.
|  |     $   /       |$|  |/  / $         |  |     /       |
|  |     $  |   (----.$|  '  /  $         |  |    |   (----.
|  |     $   \\   \\    $|    <   $   .--.  |  |     \\   \\    
|  .----.$----)   |   $|  .  \\  $   |  .--'  | .----)   |   
|_______|$_______/    $|__|\\__\\ $    \\______/  |_______/    
        $            $         $                           
`;
/* eslint-enable  */

type Color = any;
const colors: Color[][] = [
  ['bold', 'red'],
  ['bold', 'blue'],
  ['bold', 'cyan'],
  ['bold', 'yellow'],
];

export function getLogo({ color = 1 } = {}) {
  if (!color) return logo;
  const coloredLogo = logo
    .split('\n')
    .map((row) =>
      row
        .split('$')
        .map((str, cellId) => {
          if (str === '#') return colorize(' ', ['bgYellow']);
          if (!colors[cellId]) return '';
          return colorize(str.replace(/#/g, colorize(' ', ['bgYellow'])), colors[cellId]);
        })
        .join(''),
    )
    .join('\n');
  return coloredLogo;
}
export default getLogo;
