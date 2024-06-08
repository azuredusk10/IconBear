/**
* Guess which style an icon is.
* @param {Gio.File} gFile - the Gio.File object that references the SVG image
* @param {string} folderName - the name of the parent folder the icon is in
* @returns {number} 0 = undefined; 1 = outline; 2 = filled; 3 = duotone; 4 = color
**/
export const estimateIconStyle = (gFile, folderName = '') => {
  const [, contents] = gFile.load_contents(null);
  const stringContents = new TextDecoder().decode(contents);

  // Try guessing the icon's style from the name of its parent folder
  const outlineFolderMatches = folderName.match(/outline/i) || [];
  const filledFolderMatches = folderName.match(/fill|solid/i) || [];
  const duotoneFolderMatches = folderName.match(/twotone|duotone/i) || [];

  if(outlineFolderMatches.length > 0){
    return 1;
  } else if(filledFolderMatches.length > 0){
    return 2;
  } else if(duotoneFolderMatches.length > 0){
    return 3;
  }

  // If the icon style can't be determined by its parent folder name, then try guessing the icon's style from its SVG attributes
  // Detect if a "stroke" attribute is present, but not if it's followed by "none"
  const strokeMatches = stringContents.match(/\bstroke=(?!"none")/g) || [];
  // console.log('stroke matches', strokeMatches.length);

  // Detect if a "fill" attribute is present, but not if it's followed by "none"
  const fillMatches = stringContents.match(/\bfill=(?!"none")/g) || [];
  // console.log('fill matches', fillMatches.length);

  // Detect the number of colours present
  const uniqueColors = countUniqueColorsFromString(stringContents);
  // console.log('colors', uniqueColors)

  if(uniqueColors > 2){
    // It has multiple colors, it's a color icon
    return 4;

  } else if(uniqueColors == 2){
    // It has 2 colors, it's a duotone icon
    return 3;

  } else if(fillMatches.length > 0){
    // It has at least 1 fill, it's a filled icon
    return 2;

  } else if(strokeMatches.length > 0){
    // It contains no fills, only strokes; it's an outlined icon
    return 1;

  }


  return 0;
}

const countUniqueColorsFromString = (str) => {
  // Regular expression to match hex color codes
  // Source: https://stackoverflow.com/a/53330328
  const hexColorRegex = /#(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})/gi;

  // Find all matches of hex color codes in the string
  const matches = str.match(hexColorRegex) || [];

  // Create a Set to store unique colors
  const uniqueColors = new Set(matches.map(match => match.replace('#', '')));

  // Check if "currentColor" is present in the string and count it as an additional color
  if (/\bcurrentColor\b/i.test(str)) {
    uniqueColors.add('currentColor');
  }

  // Return the size of the Set (number of unique colors)
  return uniqueColors.size;
}
