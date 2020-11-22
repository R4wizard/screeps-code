const log = console.log
let buffer = []

export default {

  colors: ['#26C6DA', '#FF7043', '#78909C', '#2E78D2', '#006C7A', '#FFBEA9', '#FFBEA9', '#97BCE9', '#853A22'],

  startBuffering() {
    console.log = (...args) => {
      for(let i = 0; i < args.length; i++)
        args[i] = typeof args[i] == 'object' ? JSON.stringify(args[i]) : args[i]
      buffer.push(args.join(' '))
    }
  },

  stopBuffering() {
    console.log = log
  },

  flushBuffer() {
    const retBuffer = buffer
    buffer = []
    return retBuffer
  },

  header(text, width = 104) {
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
    console.log(`<b>---[ ${text} ]</b>`.padEnd(width + 7, '-') + "\n&nbsp;")
  },

  subheader(text, width = 104) {
    console.log(`<b>${text}:</b>`)
  },

  table(data, colors = ['inherit'], keysPerRow = 4, width = 100, rowStart = "  ") {
    let columnWidth = width / keysPerRow | 0
    let keys = Object.keys(data)
    for(let i = 0; i < keys.length; i += keysPerRow) {
      let row = rowStart
      for(let x = 0; x < keysPerRow; x++) {
        if(keys[i+x] == undefined)
          continue
        const color = colors[(i+x) % colors.length]
        const key = keys[i+x].toString().substr(0, columnWidth - 5) + ": "
        const value = data[keys[i+x]].toString().substr(0, columnWidth - key.length - 1)
        row += `<span style="color: ${color}">` + `${key}${value}`.padEnd(columnWidth) + "</span>"
      }
      console.log(row)
    }
  },

  plot(series, cfg = undefined, returnOutput = false) {
      const colored = (char, color) => {
        // do not color it if color is not specified
        return (color === undefined) ? char : (`<span style='color: ${color}'>` + char + `</span>`)
      }
      if(typeof(series[0]) == "number")
          series = [series]

      cfg = (typeof cfg !== 'undefined') ? cfg : {}

      let min = (typeof cfg.min !== 'undefined') ? cfg.min : series[0][0]
      let max = (typeof cfg.max !== 'undefined') ? cfg.max : series[0][0]

      for (let j = 0; j < series.length; j++) {
          for (let i = 0; i < series[j].length; i++) {
              min = Math.min(min, series[j][i])
              max = Math.max(max, series[j][i])
          }
      }

      let defaultSymbols = [ '┼', '┤', '╶', '╴', '─', '╰', '╭', '╮', '╯', '│' ]
      let range   = Math.abs (max - min)
      let offset  = (typeof cfg.offset  !== 'undefined') ? cfg.offset  : 3
      let padding = (typeof cfg.padding !== 'undefined') ? cfg.padding : '          '
      let height  = (typeof cfg.height  !== 'undefined') ? cfg.height  : 10
      let colors  = (typeof cfg.colors !== 'undefined') ? cfg.colors : []
      let unit    = (typeof cfg.unit  !== 'undefined') ? cfg.unit  : "ms"
      let unitScale = (typeof cfg.unit  !== 'undefined') ? cfg.unitScale  : 0
      let ratio   = range !== 0 ? height / range : 1;
      let min2    = Math.round (min * ratio)
      let max2    = Math.round (max * ratio)
      let rows    = Math.abs (max2 - min2)
      let width = 0
      for (let i = 0; i < series.length; i++) {
          width = Math.max(width, series[i].length)
      }
      width = width + offset
      let symbols = (typeof cfg.symbols !== 'undefined') ? cfg.symbols : defaultSymbols
      let format  = (typeof cfg.format !== 'undefined') ? cfg.format : function (x) {
          return (padding + x.toFixed(unitScale) + unit).slice (-padding.length)
      }

      let result = new Array (rows + 1) // empty space
      for (let i = 0; i <= rows; i++) {
          result[i] = new Array (width)
          for (let j = 0; j < width; j++) {
              result[i][j] = ' '
          }
      }
      for (let y = min2; y <= max2; ++y) { // axis + labels
          let label = format (rows > 0 ? max - (y - min2) * range / rows : y, y - min2)
          result[y - min2][Math.max (offset - label.length, 0)] = label
          result[y - min2][offset - 1] = (y == 0) ? symbols[0] : symbols[1]
      }

      const renderSeries = j => {
        let currentColor = colors[j % colors.length]
        let y0 = Math.round (series[j][0] * ratio) - min2
        result[rows - y0][offset - 1] = colored(symbols[0], currentColor) // first value

        for (let x = 0; x < series[j].length - 1; x++) { // plot the line
            let y0 = Math.round (series[j][x + 0] * ratio) - min2
            let y1 = Math.round (series[j][x + 1] * ratio) - min2
            if (y0 == y1) {
                result[rows - y0][x + offset] = colored(symbols[4], currentColor)
            } else {
                result[rows - y1][x + offset] = colored((y0 > y1) ? symbols[5] : symbols[6], currentColor)
                result[rows - y0][x + offset] = colored((y0 > y1) ? symbols[7] : symbols[8], currentColor)
                let from = Math.min (y0, y1)
                let to = Math.max (y0, y1)
                for (let y = from + 1; y < to; y++) {
                    result[rows - y][x + offset] = colored(symbols[9], currentColor)
                }
            }
        }
      }

      if(cfg.alternate) {
        let renderOffset = Game.time % series.length
        for (let j = 0; j < series.length; j++) {
          let i = (j + renderOffset) % series.length
          renderSeries(i)
        }
      } else {
        for (let j = 0; j < series.length; j++)
          renderSeries(j)
      }

      const results = result.map (function (x) { return x.join ('') })
      console.log(results.join ('\n'))
      return
      if(returnOutput)
        return results.join ('\n')
      results.forEach(l => console.log(l))
  }


}
