export const RandomArray = array => array[Math.random() * array.length | 0]

export const RandomArrays = (...arrays) => RandomArray([].concat(...arrays))
