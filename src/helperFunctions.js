/**
* Guess which style an icon is.
* @param {string} folderName - the name of the parent folder the icon is in
* @param {string} stringContents - the contents of the SVG file in string format
* @returns {number} 0 = undefined; 1 = outline; 2 = filled; 3 = duotone; 4 = color
**/
export const estimateIconStyle = (folderName, stringContents) => {
  let style = 0;

  // Try guessing the icon's style from the name of its parent folder
  const outlineFolderMatches = folderName.match(/outline/i) || [];
  const filledFolderMatches = folderName.match(/fill|solid/i) || [];
  const duotoneFolderMatches = folderName.match(/twotone|duotone/i) || [];

  if(outlineFolderMatches.length > 0){
    style = 1;
  } else if(filledFolderMatches.length > 0){
    style = 2;
  } else if(duotoneFolderMatches.length > 0){
    style = 3;
  }

  // If the icon style can't be determined by its parent folder name, then try guessing the icon's style from its SVG attributes
  if(typeof style === "undefined"){

    // Detect if a "stroke" attribute is present, but not if it's followed by "none"
    const strokeMatches = stringContents.match(/\bstroke=(?!"none")/g) || [];
    // console.log('stroke matches', strokeMatches.length);

    // Detect if a "fill" attribute is present, but not if it's followed by "none"
    const fillMatches = stringContents.match(/\bfill=(?!"none")/g) || [];
    // console.log('fill matches', fillMatches.length);

    // Detect the number of colours present
    const uniqueColors = this.countUniqueColorsFromString(stringContents);
    // console.log('colors', uniqueColors)

    if(uniqueColors > 2){
      // It has multiple colors, it's a color icon
      style = 4;

    } else if(uniqueColors == 2){
      // It has 2 colors, it's a duotone icon
      style = 3;

    } else if(fillMatches.length > 0){
      // It has at least 1 fill, it's a filled icon
      style = 2;

    } else if(strokeMatches.length > 0){
      // It contains no fills, only strokes; it's an outlined icon
      style = 1;

    }

  }

  return style;
}
