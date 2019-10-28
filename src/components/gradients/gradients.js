export const generateColor = (colorStart,colorEnd,colorCount) => {

    function hex (c) {
        var s = "0123456789abcdef";
        var i = parseInt (c);
        if (i == 0 || isNaN (c))
          return "00";
        i = Math.round (Math.min (Math.max (0, i), 255));
        return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
      }
      
      /* Convert an RGB triplet to a hex string */
      function convertToHex (rgb) {
        return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
      }
      
      /* Remove '#' in color hex string */
      function trim (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }
      
      /* Convert a hex string to an RGB triplet */
      function convertToRGB (hex) {
        var color = [];
        color[0] = parseInt ((trim(hex)).substring (0, 2), 16);
        color[1] = parseInt ((trim(hex)).substring (2, 4), 16);
        color[2] = parseInt ((trim(hex)).substring (4, 6), 16);
        return color;
      }
  
      // The beginning of your gradient
      var start = convertToRGB (colorStart);    
  
      // The end of your gradient
      var end   = convertToRGB (colorEnd);    
  
      // The number of colors to compute
      var len = colorCount - 2;
  
      //Alpha blending amount
      var alpha = 0.0;
  
      var saida = [colorStart];
      
      for (var i = 0; i < len; i++) {
          var c = [];
          alpha += (1.0/len);
          
          c[0] = end[0] * alpha + (1 - alpha) * start[0];
          c[1] = end[1] * alpha + (1 - alpha) * start[1];
          c[2] = end[2] * alpha + (1 - alpha) * start[2];
  
          saida.push(convertToHex (c));
          
      }
      saida.push(colorEnd);
      
      return saida;
}