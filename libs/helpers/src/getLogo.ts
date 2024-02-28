/* eslint-disable  */
// @ts-ignore
import { colorize } from '@lsk4/colors';

// https://onlinetools.com/ascii/convert-text-to-ascii-art
const logoLsk = `
__      $    _______.$ __  ___ $          __       _______.
|  |     $   /       |$|  |/  / $         |  |     /       |
|  |     $  |   (----.$|  '  /  $         |  |    |   (----.
|  |     $   \\   \\    $|    <   $   .--.  |  |     \\   \\    
|  .----.$----)   |   $|  .  \\  $   |  .--'  | .----)   |   
|_______|$_______/    $|__|\\__\\ $    \\______/  |_______/    
        $            $         $                           
`;
const logo = `
__     __ $  _____  $  __  __  $  _____  
\\ \\   / / $ / ____| $ |  \\/  | $ |  __ \\ 
 \\ \\_/ /  $| |      $ | \\  / | $ | |  | |
  \\   /   $| |      $ | |\\/| | $ | |  | |
   | |    $| |____  $ | |  | | $ | |__| |
   |_|    $ \\_____| $ |_|  |_| $ |_____/                        
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
